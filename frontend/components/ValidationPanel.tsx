"use client";

import { CheckCircle2, Download, TriangleAlert } from "lucide-react";
import type { Bill, ValidationResult } from "./types";

type ValidationPanelProps = {
  bills: Bill[];
  validation: ValidationResult[];
  onDownload: () => void;
};

export function ValidationPanel({ bills, validation, onDownload }: ValidationPanelProps) {
  const exportedPayload = { bills };
  const validCount = validation.filter((result) => result.is_valid).length;
  const issueCount = validation.reduce((count, result) => count + result.issues.length, 0);

  return (
    <aside className="flex min-h-0 flex-col border-l border-cmg-line bg-white">
      <div className="border-b border-cmg-line px-5 py-4">
        <h2 className="text-sm font-semibold text-cmg-ink">Validation</h2>
        <p className="mt-1 text-xs text-slate-500">
          {bills.length} bills · {validCount} valid · {issueCount} issues
        </p>
      </div>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          {validation.length === 0 ? (
            <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
              อัปโหลดและ extract เพื่อดูผล validation.
            </div>
          ) : (
            validation.map((result) => (
              <div key={`${result.bill_index}-${result.supplier_invoice_no}`} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-cmg-ink">Bill {result.bill_index + 1}</div>
                    <div className="font-mono text-xs text-slate-500">{result.supplier_invoice_no}</div>
                  </div>
                  {result.is_valid ? (
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  ) : (
                    <TriangleAlert className="text-amber-600" size={20} />
                  )}
                </div>
                {result.issues.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {result.issues.map((issue, index) => (
                      <li key={`${issue.path}-${index}`} className="rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                        <span className="font-mono text-[11px]">{issue.path}</span>: {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-500">JSON Preview</div>
          <pre className="thin-scrollbar max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {JSON.stringify(exportedPayload, null, 2)}
          </pre>
        </div>
      </div>

      <div className="border-t border-cmg-line p-5">
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cmg-ink px-4 text-sm font-bold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={bills.length === 0}
          type="button"
          onClick={onDownload}
        >
          <Download size={18} />
          Download JSON
        </button>
      </div>
    </aside>
  );
}

