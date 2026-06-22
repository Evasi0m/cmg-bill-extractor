import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import cv2

from schema import Bill, BillItem

Token = Dict[str, Any]


def normalize_model_code(raw: str) -> str:
    value = normalize_text(raw)
    value = re.sub(r"^\d{8,14}\s+", "", value)
    for prefix in ("CE ", "CB "):
        if value.startswith(prefix):
            value = value[len(prefix) :].strip()
            break
    value = re.sub(r"[^A-Z0-9\-\s]", "", value.upper())
    value = re.sub(r"\s+", " ", value).strip()
    return value


def parse_cmg_bill(image_path: Path, ocr_tokens: List[Token]) -> Bill:
    tokens = enrich_tokens(image_path, ocr_tokens)
    if not tokens:
        return empty_review_bill(is_cmg_bill=False)

    items = extract_items(tokens)
    bill = Bill(
        is_cmg_bill=looks_like_cmg_bill(tokens) or bool(extract_invoice_no(tokens) and items),
        supplier_invoice_no=extract_invoice_no(tokens) or "",
        bill_subtotal=0,
        total_qty=0,
        vat_amount=0,
        grand_total=0,
        items=items,
    )

    bill.total_qty = extract_total_qty(tokens, items) or 0
    footer = extract_footer_totals(tokens)
    if footer:
        bill.bill_subtotal = footer["bill_subtotal"]
        bill.vat_amount = footer["vat_amount"]
        bill.grand_total = footer["grand_total"]

    if not bill.supplier_invoice_no or not footer or bill.total_qty == 0:
        for item in bill.items:
            item.needs_review = True

    return bill


def empty_review_bill(is_cmg_bill: bool = True) -> Bill:
    return Bill(
        is_cmg_bill=is_cmg_bill,
        supplier_invoice_no="",
        bill_subtotal=0,
        total_qty=0,
        vat_amount=0,
        grand_total=0,
        items=[],
    )


def enrich_tokens(image_path: Path, ocr_tokens: List[Token]) -> List[Token]:
    width, height = image_size(image_path)
    enriched: List[Token] = []
    for token in ocr_tokens:
        bbox = token.get("bbox") or [0, 0, 0, 0]
        x1, y1, x2, y2 = [float(value) for value in bbox]
        item = dict(token)
        item["text"] = normalize_text(str(token.get("text", "")))
        item["x1n"] = x1 / width if width else 0
        item["x2n"] = x2 / width if width else 0
        item["y1n"] = y1 / height if height else 0
        item["y2n"] = y2 / height if height else 0
        item["cxn"] = float(token.get("cx", (x1 + x2) / 2)) / width if width else 0
        item["cyn"] = float(token.get("cy", (y1 + y2) / 2)) / height if height else 0
        enriched.append(item)
    return [token for token in enriched if token["text"]]


def image_size(image_path: Path) -> tuple[int, int]:
    image = cv2.imread(str(image_path))
    if image is None:
        return 1, 1
    height, width = image.shape[:2]
    return width, height


def looks_like_cmg_bill(tokens: List[Token]) -> bool:
    top_text = " ".join(token["text"].lower() for token in tokens if token["cyn"] < 0.22)
    return "cmg" in top_text or "central trading" in top_text


def extract_invoice_no(tokens: List[Token]) -> Optional[str]:
    candidates = []
    for token in tokens:
        digits = re.sub(r"\D", "", token["text"])
        if len(digits) != 10:
            continue
        if not (token["cxn"] > 0.62 and token["cyn"] < 0.28):
            continue
        candidates.append((token["cyn"], -token["cxn"], digits))
    if not candidates:
        return None
    return sorted(candidates)[0][2]


def extract_items(tokens: List[Token]) -> List[BillItem]:
    model_tokens = []
    for token in tokens:
        if not (0.20 <= token["cxn"] <= 0.68 and 0.25 <= token["cyn"] <= 0.68):
            continue
        model_code = extract_model_code(token["text"])
        if model_code:
            model_tokens.append((token, model_code))

    rows: List[BillItem] = []
    for token, model_code in dedupe_model_rows(model_tokens):
        near = tokens_near_y(tokens, token["cyn"], tolerance=0.018)
        quantity = nearest_int(near, 0.55, 0.72)
        unit_cost = nearest_money(near, 0.66, 0.82)
        line_amount = nearest_money(near, 0.78, 0.98)
        needs_review = (
            token.get("confidence", 1) < 0.78
            or quantity is None
            or unit_cost is None
            or line_amount is None
        )
        rows.append(
            BillItem(
                model_code=model_code,
                quantity=quantity or 0,
                unit_cost=unit_cost or 0,
                line_amount=line_amount or 0,
                needs_review=needs_review,
            )
        )
    return rows


def dedupe_model_rows(model_tokens: List[tuple[Token, str]]) -> List[tuple[Token, str]]:
    rows: List[tuple[Token, str]] = []
    for token, model_code in sorted(model_tokens, key=lambda item: item[0]["cyn"]):
        if rows and abs(rows[-1][0]["cyn"] - token["cyn"]) < 0.009:
            if len(model_code) > len(rows[-1][1]):
                rows[-1] = (token, model_code)
            continue
        rows.append((token, model_code))
    return rows


def extract_model_code(text: str) -> Optional[str]:
    clean = normalize_model_code(text)
    if "-" not in clean or not re.search(r"[A-Z]", clean):
        return None
    clean = re.sub(r"\s+", "", clean)
    if len(clean) < 7:
        return None
    # Ignore OCR fragments from footer labels or document metadata.
    if any(word in clean for word in ("TAX", "INVOICE", "DATE", "TOTAL", "VAT")):
        return None
    return clean


def tokens_near_y(tokens: List[Token], y: float, tolerance: float) -> List[Token]:
    return [token for token in tokens if abs(token["cyn"] - y) <= tolerance]


def nearest_int(tokens: List[Token], min_x: float, max_x: float) -> Optional[int]:
    candidates = []
    for token in tokens:
        if not (min_x <= token["cxn"] <= max_x):
            continue
        value = parse_int(token["text"])
        if value is not None:
            candidates.append((abs(token["cxn"] - ((min_x + max_x) / 2)), value))
    return sorted(candidates)[0][1] if candidates else None


def nearest_money(tokens: List[Token], min_x: float, max_x: float) -> Optional[float]:
    candidates = []
    for token in tokens:
        if not (min_x <= token["cxn"] <= max_x):
            continue
        value = parse_money(token["text"])
        if value is not None:
            candidates.append((abs(token["cxn"] - ((min_x + max_x) / 2)), value))
    return sorted(candidates)[0][1] if candidates else None


def extract_total_qty(tokens: List[Token], items: List[BillItem]) -> Optional[int]:
    if not items:
        return None

    last_item_y = max((token["cyn"] for token in tokens if extract_model_code(token["text"])), default=0.0)
    max_item_quantity = max((item.quantity for item in items), default=0)
    qty_column_values = []
    for token in tokens:
        if not (0.52 <= token["cxn"] <= 0.72 and 0.28 <= token["cyn"] <= 0.78):
            continue
        value = parse_int(token["text"])
        if value is not None:
            qty_column_values.append((token["cyn"], value))

    total_like_values = [
        value for _, value in qty_column_values if max_item_quantity < value <= 99
    ]
    if total_like_values:
        return max(total_like_values)

    candidates = []
    for token in tokens:
        if not (0.55 <= token["cxn"] <= 0.72 and last_item_y < token["cyn"] < 0.75):
            continue
        value = parse_int(token["text"])
        if value is not None and max_item_quantity < value <= 99:
            candidates.append((token["cyn"], value))
    if candidates:
        return sorted(candidates)[-1][1]
    return None


def extract_footer_totals(tokens: List[Token]) -> Optional[Dict[str, float]]:
    amounts = []
    for token in tokens:
        if not (token["cxn"] > 0.68 and token["cyn"] > 0.58):
            continue
        value = parse_money(token["text"])
        if value is not None:
            amounts.append((token["cyn"], token["cxn"], value))

    unique_amounts: List[tuple[float, float, float]] = []
    for amount in sorted(amounts):
        if unique_amounts and abs(unique_amounts[-1][0] - amount[0]) < 0.012 and abs(unique_amounts[-1][2] - amount[2]) < 0.01:
            continue
        unique_amounts.append(amount)

    if len(unique_amounts) < 3:
        return None

    last_three = [amount[2] for amount in unique_amounts[-3:]]
    return {
        "bill_subtotal": last_three[0],
        "vat_amount": last_three[1],
        "grand_total": last_three[2],
    }


def parse_int(text: str) -> Optional[int]:
    if re.search(r"[A-Za-z]", text):
        return None
    clean = re.sub(r"[^\d]", "", text)
    if not clean or len(clean) > 3:
        return None
    return int(clean)


def parse_money(text: str) -> Optional[float]:
    match = re.search(r"\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2}", text)
    if not match:
        return None
    return float(match.group(0).replace(",", ""))


def normalize_text(text: str) -> str:
    return (
        text.replace("—", "-")
        .replace("–", "-")
        .replace("−", "-")
        .replace("／", "/")
        .strip()
    )
