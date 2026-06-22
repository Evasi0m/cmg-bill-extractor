import type { Bill, ExtractionResponse, UploadedImage } from "./types";
import { validatePayload } from "./validation";

const item = (
  model_code: string,
  quantity: number,
  unit_cost: number,
  line_amount: number,
  needs_review = false
) => ({
  model_code,
  quantity,
  unit_cost,
  line_amount,
  needs_review
});

const sampleBills: Record<string, Bill> = {
  "12.JPG": {
    is_cmg_bill: true,
    supplier_invoice_no: "1312256608",
    bill_subtotal: 37721.58,
    total_qty: 55,
    vat_amount: 2640.51,
    grand_total: 40362.09,
    items: [
      item("LTP-V007L-7B1UDF", 5, 471.03, 2355.15),
      item("LTP-V007L-7B2UDF", 1, 510.28, 510.28),
      item("LTP-V007L-9BUDF", 1, 471.03, 471.03),
      item("LTP-V300L-7A2UDF", 1, 981.31, 981.31, true),
      item("LTP-VT01D-1BUDF", 3, 706.54, 2119.62),
      item("LTP-VT01D-7BUDF", 3, 706.54, 2119.62),
      item("LTP-VT01G-1BUDF", 5, 863.55, 4317.75),
      item("LTP-VT01G-9BUDF", 3, 863.55, 2590.65),
      item("LTP-VT02BL-3AUDF", 3, 745.79, 2237.37),
      item("LW-204-1BDF", 5, 588.79, 2943.95),
      item("LW-204-4ADF", 5, 588.79, 2943.95),
      item("LW-204-7ADF", 5, 588.79, 2943.95),
      item("LW-204-9ADF", 5, 588.79, 2943.95),
      item("MQ-24DA-1ADF", 5, 824.3, 4121.5),
      item("MQ-24DA-2ADF", 5, 824.3, 4121.5)
    ]
  },
  "13.JPG": {
    is_cmg_bill: true,
    supplier_invoice_no: "1312257065",
    bill_subtotal: 10755.15,
    total_qty: 12,
    vat_amount: 752.86,
    grand_total: 11508.01,
    items: [
      item("LTP-1303DD-4AVDF", 1, 745.79, 745.79),
      item("MTS-RS100L-1AVDF", 2, 2001.87, 4003.74),
      item("W-218HC-8AVDF", 4, 471.03, 1884.12),
      item("W-738H-3AVDF", 5, 824.3, 4121.5)
    ]
  },
  "8.JPG": {
    is_cmg_bill: true,
    supplier_invoice_no: "1312256569",
    bill_subtotal: 41528.95,
    total_qty: 42,
    vat_amount: 2907.03,
    grand_total: 44435.98,
    items: [
      item("MQ-24DA-3ADF", 5, 824.3, 4121.5),
      item("MQ-24GA-1ADF", 5, 1138.32, 5691.6),
      item("MRW-230H-1E2VDF", 3, 745.79, 2237.37),
      item("MRW-230H-1E4VDF", 3, 745.79, 2237.37),
      item("MRW-230H-2EVDF", 3, 745.79, 2237.37),
      item("MTP-1302DD-5AVDF", 3, 902.8, 2708.4),
      item("MTP-1302DD-9AVDF", 3, 902.8, 2708.4),
      item("MTP-1302DS-1AVDF", 2, 1138.32, 2276.64),
      item("MTP-1302DS-7AVDF", 3, 1138.32, 3414.96),
      item("MTP-1335D-2A2VDF", 2, 863.55, 1727.1),
      item("MTP-1370D-2A2VDF", 2, 902.8, 1805.6),
      item("MTP-1374D-2A3VDF", 2, 1295.33, 2590.66),
      item("MTP-1374D-5A2VDF", 2, 1295.33, 2590.66),
      item("MTP-1374D-7A2VDF", 3, 1295.33, 3885.99),
      item("MTP-B146D-1AVDF", 1, 1295.33, 1295.33)
    ]
  },
  "10.JPG": {
    is_cmg_bill: true,
    supplier_invoice_no: "1312257011",
    bill_subtotal: 32500.98,
    total_qty: 41,
    vat_amount: 2275.07,
    grand_total: 34776.05,
    items: [
      item("MTP-V300D-1A2UDF", 3, 1020.56, 3061.68),
      item("MTP-V300D-2AUDF", 3, 1020.56, 3061.68),
      item("MTP-VD01-1BVUDF", 3, 628.04, 1884.12),
      item("MTP-VD01L-2BVUDF", 3, 667.29, 2001.87),
      item("MTP-VD03B-1AUDF", 3, 981.31, 2943.93),
      item("MTP-VD03D-1AUDF", 2, 785.05, 1570.1),
      item("MTP-VD03D-2A2UDF", 3, 785.05, 2355.15),
      item("MTP-VD03D-2AUDF", 4, 785.05, 3140.2),
      item("MTP-VD03D-3A1UDF", 3, 785.05, 2355.15),
      item("MTP-VT01B-1BUDF", 2, 942.06, 1884.12),
      item("MTP-VT01B-2BUDF", 2, 942.06, 1884.12),
      item("MTP-VT01D-2BUDF", 5, 706.54, 3532.7),
      item("MTS-115D-2A1VDF", 1, 1413.08, 1413.08, true),
      item("MW-240-1E2VDF", 2, 353.27, 706.54),
      item("MW-240-1EVDF", 2, 353.27, 706.54)
    ]
  },
  "11.JPG": {
    is_cmg_bill: true,
    supplier_invoice_no: "1312256683",
    bill_subtotal: 55777.54,
    total_qty: 49,
    vat_amount: 3904.43,
    grand_total: 59681.97,
    items: [
      item("GMA-S140PP-4ADR", 3, 2041.12, 6123.36),
      item("GM-S2110PG-4ADR", 2, 3611.21, 7222.42),
      item("LF-20W-1ADF", 5, 549.53, 2747.65),
      item("LF-20W-8ADF", 5, 549.53, 2747.65),
      item("LTP-1234DS-4ADF", 2, 1020.56, 2041.12),
      item("LTP-1302DD-4A1VDF", 3, 902.8, 2708.4),
      item("LTP-1302DS-2AVDF", 3, 1138.32, 3414.96),
      item("LTP-1308D-2AVDF", 2, 785.05, 1570.1),
      item("LTP-1308D-4AVDF", 2, 785.05, 1570.1),
      item("LTP-1335D-2AVDF", 2, 824.3, 1648.6),
      item("LTP-1335D-4AVDF", 3, 824.3, 2472.9),
      item("LTP-H157MR-9ADF", 5, 1530.84, 7654.2),
      item("LTP-H157MRB-1BDF", 2, 1530.84, 3061.68),
      item("LTP-E412PG-4ADF", 5, 1687.85, 8439.25),
      item("LTP-V007L-1BUDF", 5, 471.03, 2355.15)
    ]
  },
  "9.JPG": {
    is_cmg_bill: true,
    supplier_invoice_no: "1312257061",
    bill_subtotal: 63706.67,
    total_qty: 107,
    vat_amount: 4459.47,
    grand_total: 68166.14,
    items: [
      item("MW-620H-1AVDF", 10, 667.29, 6672.9),
      item("MW-620H-2AVDF", 5, 667.29, 3336.45),
      item("MW-620H-3AVDF", 5, 667.29, 3336.45),
      item("MWA-100HD-1AVDF", 4, 1256.07, 5024.28),
      item("MWA-300H-1AVDF", 2, 1373.83, 2747.66),
      item("MWA-300H-3AVDF", 1, 1373.83, 1373.83),
      item("W-218H-1AVDF", 10, 471.03, 4710.3),
      item("W-218H-1BVDF", 20, 471.03, 9420.6),
      item("W-218H-2AVDF", 5, 471.03, 2355.15),
      item("W-218H-3AVDF", 10, 471.03, 4710.3),
      item("W-218H-4BVDF", 5, 471.03, 2355.15),
      item("W-218HC-2AVDF", 5, 471.03, 2355.15),
      item("W-218HC-4AVDF", 10, 471.03, 4710.3),
      item("W-218HM-7AVDF", 5, 471.03, 2355.15),
      item("W-738H-1AVDF", 10, 824.3, 8243)
    ]
  }
};

const fallbackBill = (index: number): Bill => ({
  is_cmg_bill: true,
  supplier_invoice_no: String(9000000000 + index).slice(0, 10),
  bill_subtotal: 2355.15,
  total_qty: 5,
  vat_amount: 164.86,
  grand_total: 2520.01,
  items: [item("LTP-V007L-7B1UDF", 5, 471.03, 2355.15, true)]
});

export function mockExtract(images: UploadedImage[]): ExtractionResponse {
  const bills = images.map((image, index) => {
    const match = Object.entries(sampleBills).find(([suffix]) => image.name.endsWith(suffix));
    return structuredClone(match?.[1] ?? fallbackBill(index + 1));
  });

  return {
    bills,
    validation: validatePayload(bills)
  };
}
