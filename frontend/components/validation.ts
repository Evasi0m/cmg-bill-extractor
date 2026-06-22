import type { Bill, ValidationIssue, ValidationResult } from "./types";

const money = (value: number) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const within = (actual: number, expected: number, tolerance: number) =>
  Math.abs(money(actual) - money(expected)) <= tolerance;

export function validateBill(bill: Bill, billIndex: number): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!bill.is_cmg_bill) {
    issues.push({ path: "is_cmg_bill", message: "เอกสารนี้อาจไม่ใช่บิล CMG", severity: "error" });
  }

  if (!/^\d{10}$/.test(bill.supplier_invoice_no)) {
    issues.push({
      path: "supplier_invoice_no",
      message: "เลขที่ใบกำกับต้องเป็นตัวเลข 10 หลัก และห้ามใช้ barcode 13 หลัก",
      severity: "error"
    });
  }

  const qtySum = bill.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (qtySum !== Number(bill.total_qty)) {
    issues.push({
      path: "total_qty",
      message: `ผลรวมจำนวนสินค้า ${qtySum} ไม่ตรงกับยอดรวม ${bill.total_qty}`,
      severity: "error"
    });
  }

  const lineSum = money(bill.items.reduce((sum, item) => sum + Number(item.line_amount || 0), 0));
  if (!within(lineSum, bill.bill_subtotal, 0.05)) {
    issues.push({
      path: "bill_subtotal",
      message: `ผลรวมจำนวนเงิน ${lineSum.toFixed(2)} ไม่ตรงกับราคารวม ${money(bill.bill_subtotal).toFixed(2)}`,
      severity: "error"
    });
  }

  const expectedVat = money(Number(bill.bill_subtotal || 0) * 0.07);
  if (!within(bill.vat_amount, expectedVat, 0.05)) {
    issues.push({
      path: "vat_amount",
      message: `VAT 7% ควรเป็น ${expectedVat.toFixed(2)} แต่พบ ${money(bill.vat_amount).toFixed(2)}`,
      severity: "error"
    });
  }

  const expectedGrandTotal = money(Number(bill.bill_subtotal || 0) + Number(bill.vat_amount || 0));
  if (!within(bill.grand_total, expectedGrandTotal, 0.05)) {
    issues.push({
      path: "grand_total",
      message: `ยอดรวมควรเป็น ${expectedGrandTotal.toFixed(2)} แต่พบ ${money(bill.grand_total).toFixed(2)}`,
      severity: "error"
    });
  }

  bill.items.forEach((item, index) => {
    const expectedLine = money(Number(item.quantity || 0) * Number(item.unit_cost || 0));
    if (!within(item.line_amount, expectedLine, 0.02)) {
      issues.push({
        path: `items.${index}.line_amount`,
        message: `แถว ${index + 1}: จำนวน x ราคาต่อหน่วยควรเป็น ${expectedLine.toFixed(2)} แต่พบ ${money(item.line_amount).toFixed(2)}`,
        severity: "error"
      });
    }
  });

  return {
    bill_index: billIndex,
    supplier_invoice_no: bill.supplier_invoice_no,
    is_valid: issues.length === 0,
    issues
  };
}

export function validatePayload(bills: Bill[]): ValidationResult[] {
  return bills.map((bill, index) => validateBill(bill, index));
}

