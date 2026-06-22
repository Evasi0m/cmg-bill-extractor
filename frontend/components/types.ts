export type BillItem = {
  model_code: string;
  quantity: number;
  unit_cost: number;
  line_amount: number;
  needs_review: boolean;
};

export type Bill = {
  is_cmg_bill: boolean;
  supplier_invoice_no: string;
  bill_subtotal: number;
  total_qty: number;
  vat_amount: number;
  grand_total: number;
  items: BillItem[];
};

export type BillsPayload = {
  bills: Bill[];
};

export type ValidationIssue = {
  path: string;
  message: string;
  severity: "error" | "warning" | string;
};

export type ValidationResult = {
  bill_index: number;
  supplier_invoice_no: string;
  is_valid: boolean;
  issues: ValidationIssue[];
};

export type ExtractionResponse = BillsPayload & {
  validation: ValidationResult[];
};

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
  file: File;
};

