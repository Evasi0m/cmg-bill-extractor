from typing import List

from pydantic import BaseModel, Field


class BillItem(BaseModel):
    model_code: str
    quantity: int = Field(ge=0)
    unit_cost: float = Field(ge=0)
    line_amount: float = Field(ge=0)
    needs_review: bool = False


class Bill(BaseModel):
    is_cmg_bill: bool = True
    supplier_invoice_no: str = ""
    bill_subtotal: float = Field(ge=0)
    total_qty: int = Field(ge=0)
    vat_amount: float = Field(ge=0)
    grand_total: float = Field(ge=0)
    items: List[BillItem]


class BillsPayload(BaseModel):
    bills: List[Bill]


class ValidationIssue(BaseModel):
    path: str
    message: str
    severity: str = "error"


class ValidationResult(BaseModel):
    bill_index: int
    supplier_invoice_no: str
    is_valid: bool
    issues: List[ValidationIssue] = []


class ExtractionResponse(BillsPayload):
    validation: List[ValidationResult]
