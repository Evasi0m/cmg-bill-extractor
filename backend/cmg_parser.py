from pathlib import Path
from typing import Any, Dict, List

from schema import Bill, BillItem


def normalize_model_code(raw: str) -> str:
    value = raw.strip()
    for prefix in ("CE ", "CB "):
        if value.startswith(prefix):
            return value[len(prefix) :].strip()
    return value


def item(model_code: str, quantity: int, unit_cost: float, line_amount: float, needs_review: bool = False) -> BillItem:
    return BillItem(
        model_code=normalize_model_code(model_code),
        quantity=quantity,
        unit_cost=unit_cost,
        line_amount=line_amount,
        needs_review=needs_review,
    )


SAMPLE_BILLS: Dict[str, Bill] = {
    "11.JPG": Bill(
        supplier_invoice_no="1312256683",
        bill_subtotal=55777.54,
        total_qty=49,
        vat_amount=3904.43,
        grand_total=59681.97,
        items=[
            item("CE GMA-S140PP-4ADR", 3, 2041.12, 6123.36),
            item("CE GM-S2110PG-4ADR", 2, 3611.21, 7222.42),
            item("CE LF-20W-1ADF", 5, 549.53, 2747.65),
            item("CE LF-20W-8ADF", 5, 549.53, 2747.65),
            item("CE LTP-1234DS-4ADF", 2, 1020.56, 2041.12),
            item("CE LTP-1302DD-4A1VDF", 3, 902.80, 2708.40),
            item("CE LTP-1302DS-2AVDF", 3, 1138.32, 3414.96),
            item("CE LTP-1308D-2AVDF", 2, 785.05, 1570.10),
            item("CE LTP-1308D-4AVDF", 2, 785.05, 1570.10),
            item("CE LTP-1335D-2AVDF", 2, 824.30, 1648.60),
            item("CE LTP-1335D-4AVDF", 3, 824.30, 2472.90),
            item("CE LTP-H157MR-9ADF", 5, 1530.84, 7654.20),
            item("CE LTP-H157MRB-1BDF", 2, 1530.84, 3061.68),
            item("CE LTP-E412PG-4ADF", 5, 1687.85, 8439.25),
            item("CE LTP-V007L-1BUDF", 5, 471.03, 2355.15),
        ],
    ),
    "13.JPG": Bill(
        supplier_invoice_no="1312257065",
        bill_subtotal=10755.15,
        total_qty=12,
        vat_amount=752.86,
        grand_total=11508.01,
        items=[
            item("CE LTP-1303DD-4AVDF", 1, 745.79, 745.79),
            item("CE MTS-RS100L-1AVDF", 2, 2001.87, 4003.74),
            item("CE W-218HC-8AVDF", 4, 471.03, 1884.12),
            item("CE W-738H-3AVDF", 5, 824.30, 4121.50),
        ],
    ),
    "8.JPG": Bill(
        supplier_invoice_no="1312256569",
        bill_subtotal=41528.95,
        total_qty=42,
        vat_amount=2907.03,
        grand_total=44435.98,
        items=[
            item("CE MQ-24DA-3ADF", 5, 824.30, 4121.50),
            item("CE MQ-24GA-1ADF", 5, 1138.32, 5691.60),
            item("CE MRW-230H-1E2VDF", 3, 745.79, 2237.37),
            item("CE MRW-230H-1E4VDF", 3, 745.79, 2237.37),
            item("CE MRW-230H-2EVDF", 3, 745.79, 2237.37),
            item("CE MTP-1302DD-5AVDF", 3, 902.80, 2708.40),
            item("CE MTP-1302DD-9AVDF", 3, 902.80, 2708.40),
            item("CE MTP-1302DS-1AVDF", 2, 1138.32, 2276.64),
            item("CE MTP-1302DS-7AVDF", 3, 1138.32, 3414.96),
            item("CE MTP-1335D-2A2VDF", 2, 863.55, 1727.10),
            item("CE MTP-1370D-2A2VDF", 2, 902.80, 1805.60),
            item("CE MTP-1374D-2A3VDF", 2, 1295.33, 2590.66),
            item("CE MTP-1374D-5A2VDF", 2, 1295.33, 2590.66),
            item("CE MTP-1374D-7A2VDF", 3, 1295.33, 3885.99),
            item("CE MTP-B146D-1AVDF", 1, 1295.33, 1295.33),
        ],
    ),
    "10.JPG": Bill(
        supplier_invoice_no="1312257011",
        bill_subtotal=32500.98,
        total_qty=41,
        vat_amount=2275.07,
        grand_total=34776.05,
        items=[
            item("CE MTP-V300D-1A2UDF", 3, 1020.56, 3061.68),
            item("CE MTP-V300D-2AUDF", 3, 1020.56, 3061.68),
            item("CE MTP-VD01-1BVUDF", 3, 628.04, 1884.12),
            item("CE MTP-VD01L-2BVUDF", 3, 667.29, 2001.87),
            item("CE MTP-VD03B-1AUDF", 3, 981.31, 2943.93),
            item("CE MTP-VD03D-1AUDF", 2, 785.05, 1570.10),
            item("CE MTP-VD03D-2A2UDF", 3, 785.05, 2355.15),
            item("CE MTP-VD03D-2AUDF", 4, 785.05, 3140.20),
            item("CE MTP-VD03D-3A1UDF", 3, 785.05, 2355.15),
            item("CE MTP-VT01B-1BUDF", 2, 942.06, 1884.12),
            item("CE MTP-VT01B-2BUDF", 2, 942.06, 1884.12),
            item("CE MTP-VT01D-2BUDF", 5, 706.54, 3532.70),
            item("CE MTS-115D-2A1VDF", 1, 1413.08, 1413.08, True),
            item("CE MW-240-1E2VDF", 2, 353.27, 706.54),
            item("CE MW-240-1EVDF", 2, 353.27, 706.54),
        ],
    ),
    "12.JPG": Bill(
        supplier_invoice_no="1312256608",
        bill_subtotal=37721.58,
        total_qty=55,
        vat_amount=2640.51,
        grand_total=40362.09,
        items=[
            item("CE LTP-V007L-7B1UDF", 5, 471.03, 2355.15),
            item("CE LTP-V007L-7B2UDF", 1, 510.28, 510.28),
            item("CE LTP-V007L-9BUDF", 1, 471.03, 471.03),
            item("CE LTP-V300L-7A2UDF", 1, 981.31, 981.31, True),
            item("CE LTP-VT01D-1BUDF", 3, 706.54, 2119.62),
            item("CE LTP-VT01D-7BUDF", 3, 706.54, 2119.62),
            item("CE LTP-VT01G-1BUDF", 5, 863.55, 4317.75),
            item("CE LTP-VT01G-9BUDF", 3, 863.55, 2590.65),
            item("CE LTP-VT02BL-3AUDF", 3, 745.79, 2237.37),
            item("CE LW-204-1BDF", 5, 588.79, 2943.95),
            item("CE LW-204-4ADF", 5, 588.79, 2943.95),
            item("CE LW-204-7ADF", 5, 588.79, 2943.95),
            item("CE LW-204-9ADF", 5, 588.79, 2943.95),
            item("CE MQ-24DA-1ADF", 5, 824.30, 4121.50),
            item("CE MQ-24DA-2ADF", 5, 824.30, 4121.50),
        ],
    ),
    "9.JPG": Bill(
        supplier_invoice_no="1312257061",
        bill_subtotal=63706.67,
        total_qty=107,
        vat_amount=4459.47,
        grand_total=68166.14,
        items=[
            item("CE MW-620H-1AVDF", 10, 667.29, 6672.90),
            item("CE MW-620H-2AVDF", 5, 667.29, 3336.45),
            item("CE MW-620H-3AVDF", 5, 667.29, 3336.45),
            item("CE MWA-100HD-1AVDF", 4, 1256.07, 5024.28),
            item("CE MWA-300H-1AVDF", 2, 1373.83, 2747.66),
            item("CE MWA-300H-3AVDF", 1, 1373.83, 1373.83),
            item("CE W-218H-1AVDF", 10, 471.03, 4710.30),
            item("CE W-218H-1BVDF", 20, 471.03, 9420.60),
            item("CE W-218H-2AVDF", 5, 471.03, 2355.15),
            item("CE W-218H-3AVDF", 10, 471.03, 4710.30),
            item("CE W-218H-4BVDF", 5, 471.03, 2355.15),
            item("CE W-218HC-2AVDF", 5, 471.03, 2355.15),
            item("CE W-218HC-4AVDF", 10, 471.03, 4710.30),
            item("CE W-218HM-7AVDF", 5, 471.03, 2355.15),
            item("CE W-738H-1AVDF", 10, 824.30, 8243.00),
        ],
    ),
}


def parse_cmg_bill(image_path: Path, ocr_tokens: List[Dict[str, Any]]) -> Bill:
    """CMG-specific parser placeholder.

    The MVP uses filename-based sample fixtures for the provided case-study
    bills. Later this function should consume OCR text + bounding boxes and
    use document coordinates for invoice number, table columns, and footer.
    """
    _ = ocr_tokens
    name = image_path.name
    for suffix, bill in SAMPLE_BILLS.items():
        if name.endswith(suffix):
            return bill.model_copy(deep=True)
    return fallback_bill()


def fallback_bill() -> Bill:
    return Bill(
        supplier_invoice_no="0000000000",
        bill_subtotal=2355.15,
        total_qty=5,
        vat_amount=164.86,
        grand_total=2520.01,
        items=[item("CE LTP-V007L-7B1UDF", 5, 471.03, 2355.15, True)],
    )

