"use client";

import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { Bill } from "./types";
import type { ValidationResult } from "./types";

type BillEditorProps = {
  bill: Bill;
  billIndex: number;
  validation?: ValidationResult;
  onChange: (billIndex: number, bill: Bill) => void;
};

const numberValue = (value: string) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

export function BillEditor({ bill, billIndex, validation, onChange }: BillEditorProps) {
  const updateBill = (patch: Partial<Bill>) => onChange(billIndex, { ...bill, ...patch });

  const updateItem = (itemIndex: number, key: keyof Bill["items"][number], value: string | boolean) => {
    const items = bill.items.map((item, index) => {
      if (index !== itemIndex) return item;
      if (key === "model_code") return { ...item, model_code: String(value) };
      if (key === "needs_review") return { ...item, needs_review: Boolean(value) };
      return { ...item, [key]: numberValue(String(value)) };
    });
    updateBill({ items });
  };

  const addItem = () => {
    updateBill({
      items: [
        ...bill.items,
        {
          model_code: "",
          quantity: 0,
          unit_cost: 0,
          line_amount: 0,
          needs_review: true
        }
      ]
    });
  };

  const removeItem = (itemIndex: number) => {
    updateBill({ items: bill.items.filter((_, index) => index !== itemIndex) });
  };

  return (
    <section className="border-b border-cmg-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-cmg-ink">Bill {billIndex + 1}</h2>
            {validation?.is_valid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <AlertTriangle size={14} />
                Review
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            1 image = 1 bill object. Export จะไม่มี field อื่นนอก schema.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            checked={bill.is_cmg_bill}
            className="h-4 w-4 accent-cmg-red"
            type="checkbox"
            onChange={(event) => updateBill({ is_cmg_bill: event.target.checked })}
          />
          is_cmg_bill
        </label>
      </div>

      <div className="grid gap-3 px-5 pb-4 sm:grid-cols-2 xl:grid-cols-5">
        <Field
          label="supplier_invoice_no"
          value={bill.supplier_invoice_no}
          onChange={(value) => updateBill({ supplier_invoice_no: value.replace(/\D/g, "").slice(0, 10) })}
        />
        <Field label="bill_subtotal" type="number" value={bill.bill_subtotal} onChange={(value) => updateBill({ bill_subtotal: numberValue(value) })} />
        <Field label="total_qty" type="number" value={bill.total_qty} onChange={(value) => updateBill({ total_qty: numberValue(value) })} />
        <Field label="vat_amount" type="number" value={bill.vat_amount} onChange={(value) => updateBill({ vat_amount: numberValue(value) })} />
        <Field label="grand_total" type="number" value={bill.grand_total} onChange={(value) => updateBill({ grand_total: numberValue(value) })} />
      </div>

      <div className="thin-scrollbar overflow-x-auto px-5 pb-5">
        <table className="min-w-[920px] w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-normal text-slate-500">
              <th className="border-b border-cmg-line px-3 py-2">#</th>
              <th className="border-b border-cmg-line px-3 py-2">model_code</th>
              <th className="border-b border-cmg-line px-3 py-2">quantity</th>
              <th className="border-b border-cmg-line px-3 py-2">unit_cost</th>
              <th className="border-b border-cmg-line px-3 py-2">line_amount</th>
              <th className="border-b border-cmg-line px-3 py-2">needs_review</th>
              <th className="border-b border-cmg-line px-3 py-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, itemIndex) => (
              <tr key={`${billIndex}-${itemIndex}`} className="align-middle">
                <td className="border-b border-slate-100 px-3 py-2 text-slate-500">{itemIndex + 1}</td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <input
                    className="w-full min-w-[260px] rounded-md border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs outline-none focus:border-cmg-red focus:ring-2 focus:ring-red-100"
                    value={item.model_code}
                    onChange={(event) => updateItem(itemIndex, "model_code", event.target.value)}
                  />
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <input
                    className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-right outline-none focus:border-cmg-red focus:ring-2 focus:ring-red-100"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateItem(itemIndex, "quantity", event.target.value)}
                  />
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <input
                    className="w-28 rounded-md border border-slate-200 px-2 py-1.5 text-right outline-none focus:border-cmg-red focus:ring-2 focus:ring-red-100"
                    type="number"
                    value={item.unit_cost}
                    onChange={(event) => updateItem(itemIndex, "unit_cost", event.target.value)}
                  />
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <input
                    className="w-28 rounded-md border border-slate-200 px-2 py-1.5 text-right outline-none focus:border-cmg-red focus:ring-2 focus:ring-red-100"
                    type="number"
                    value={item.line_amount}
                    onChange={(event) => updateItem(itemIndex, "line_amount", event.target.value)}
                  />
                </td>
                <td className="border-b border-slate-100 px-3 py-2">
                  <input
                    checked={item.needs_review}
                    className="h-4 w-4 accent-amber-500"
                    type="checkbox"
                    onChange={(event) => updateItem(itemIndex, "needs_review", event.target.checked)}
                  />
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-right">
                  <button
                    aria-label="Remove row"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-cmg-red"
                    type="button"
                    onClick={() => removeItem(itemIndex)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-cmg-line px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={addItem}
        >
          <Plus size={16} />
          Add item
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  type = "text",
  onChange
}: {
  label: string;
  value: string | number;
  type?: "text" | "number";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cmg-red focus:ring-2 focus:ring-red-100"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

