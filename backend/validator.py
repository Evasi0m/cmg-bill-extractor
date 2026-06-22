from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional

from schema import Bill, ValidationIssue, ValidationResult


def money(value: float) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def within(actual: Decimal, expected: Decimal, tolerance: str) -> bool:
    return abs(actual - expected) <= Decimal(tolerance)


def validate_bill(
    bill: Bill,
    bill_index: int = 0,
    expected_product_rows: Optional[int] = None,
) -> ValidationResult:
    issues: List[ValidationIssue] = []

    if not bill.is_cmg_bill:
        issues.append(
            ValidationIssue(path="is_cmg_bill", message="เอกสารนี้อาจไม่ใช่บิล CMG")
        )

    if len(bill.supplier_invoice_no) != 10 or not bill.supplier_invoice_no.isdigit():
        issues.append(
            ValidationIssue(
                path="supplier_invoice_no",
                message="เลขที่ใบกำกับต้องเป็นตัวเลข 10 หลัก และห้ามใช้ barcode 13 หลัก",
            )
        )

    if expected_product_rows is not None and len(bill.items) != expected_product_rows:
        issues.append(
            ValidationIssue(
                path="items",
                message=f"จำนวนแถวสินค้าไม่ตรงกับที่พิมพ์ไว้ ({len(bill.items)} != {expected_product_rows})",
            )
        )

    qty_sum = sum(item.quantity for item in bill.items)
    if qty_sum != bill.total_qty:
        issues.append(
            ValidationIssue(
                path="total_qty",
                message=f"ผลรวมจำนวนสินค้า {qty_sum} ไม่ตรงกับยอดรวม {bill.total_qty}",
            )
        )

    line_sum = money(sum(item.line_amount for item in bill.items))
    if not within(line_sum, money(bill.bill_subtotal), "0.05"):
        issues.append(
            ValidationIssue(
                path="bill_subtotal",
                message=f"ผลรวมจำนวนเงิน {line_sum} ไม่ตรงกับราคารวม {money(bill.bill_subtotal)}",
            )
        )

    expected_vat = money(money(bill.bill_subtotal) * Decimal("0.07"))
    if not within(money(bill.vat_amount), expected_vat, "0.05"):
        issues.append(
            ValidationIssue(
                path="vat_amount",
                message=f"VAT 7% ควรเป็น {expected_vat} แต่พบ {money(bill.vat_amount)}",
            )
        )

    expected_grand_total = money(money(bill.bill_subtotal) + money(bill.vat_amount))
    if not within(money(bill.grand_total), expected_grand_total, "0.05"):
        issues.append(
            ValidationIssue(
                path="grand_total",
                message=f"ยอดรวมควรเป็น {expected_grand_total} แต่พบ {money(bill.grand_total)}",
            )
        )

    for index, item in enumerate(bill.items):
        expected_line = money(Decimal(item.quantity) * money(item.unit_cost))
        if not within(money(item.line_amount), expected_line, "0.02"):
            issues.append(
                ValidationIssue(
                    path=f"items.{index}.line_amount",
                    message=(
                        f"แถว {index + 1}: จำนวน x ราคาต่อหน่วยควรเป็น "
                        f"{expected_line} แต่พบ {money(item.line_amount)}"
                    ),
                )
            )

    if issues:
        mark_suspicious_rows(bill)

    return ValidationResult(
        bill_index=bill_index,
        supplier_invoice_no=bill.supplier_invoice_no,
        is_valid=len(issues) == 0,
        issues=issues,
    )


def mark_suspicious_rows(bill: Bill) -> None:
    for item in bill.items:
        expected_line = money(Decimal(item.quantity) * money(item.unit_cost))
        if not within(money(item.line_amount), expected_line, "0.02"):
            item.needs_review = True

