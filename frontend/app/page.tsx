"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Braces, RefreshCw } from "lucide-react";
import { BillEditor } from "../components/BillEditor";
import { UploadRail } from "../components/UploadRail";
import { ValidationPanel } from "../components/ValidationPanel";
import type { Bill, ExtractionResponse, UploadedImage, ValidationResult } from "../components/types";
import { validatePayload } from "../components/validation";
import { mockExtract } from "../components/mockExtractor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const IS_STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

export default function Home() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [serverValidation, setServerValidation] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => {
    if (bills.length === 0) return serverValidation;
    return validatePayload(bills);
  }, [bills, serverValidation]);

  const addFiles = (incoming: FileList | File[]) => {
    const files = Array.from(incoming).filter((file) => /image\/(png|jpeg)/.test(file.type));
    const nextImages = files.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      name: file.name,
      file,
      url: URL.createObjectURL(file)
    }));
    setImages((current) => [...current, ...nextImages]);
    setError(null);
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const extractBills = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_STATIC_DEMO) {
        const data = mockExtract(images);
        setBills(data.bills);
        setServerValidation(data.validation);
        setError("GitHub Pages demo mode: ใช้ mock extractor ใน browser เพราะ Pages ไม่สามารถรัน FastAPI backend ได้");
        return;
      }

      const formData = new FormData();
      images.forEach((image) => formData.append("files", image.file, image.name));

      const response = await fetch(`${API_URL}/api/extract`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as ExtractionResponse;
      setBills(data.bills);
      setServerValidation(data.validation);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unknown extraction error";
      const data = mockExtract(images);
      setBills(data.bills);
      setServerValidation(data.validation);
      setError(`เชื่อมต่อ backend ไม่สำเร็จ จึงใช้ mock extractor แทน: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBill = (billIndex: number, bill: Bill) => {
    setBills((current) => current.map((item, index) => (index === billIndex ? bill : item)));
  };

  const downloadJson = () => {
    const payload = { bills };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cmg-bills.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex h-screen min-h-[760px] flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-cmg-line bg-white px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cmg-red text-white">
            <Braces size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-5 text-cmg-ink">CMG Bill JSON Extractor</h1>
            <p className="text-xs font-medium text-slate-500">TIMES POS</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
          <RefreshCw size={14} />
          {IS_STATIC_DEMO ? "GitHub Pages demo mode" : "OCR stub MVP · PaddleOCR/Surya-ready backend"}
        </div>
      </header>

      {error && (
        <div className="flex shrink-0 items-center gap-2 border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        <UploadRail images={images} isLoading={isLoading} onExtract={extractBills} onFiles={addFiles} onRemove={removeImage} />

        <section className="thin-scrollbar min-h-0 overflow-y-auto bg-white">
          <div className="border-b border-cmg-line px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-cmg-ink">Bills</h2>
                <p className="mt-1 text-xs text-slate-500">ตรวจและแก้ค่าให้ตรงกับ schema ก่อน export JSON.</p>
              </div>
              <div className="rounded-md border border-cmg-line px-3 py-2 text-xs font-semibold text-slate-600">
                {bills.length} bill objects
              </div>
            </div>
          </div>

          {bills.length === 0 ? (
            <div className="flex min-h-[520px] items-center justify-center px-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cmg-soft text-cmg-red">
                  <Braces size={24} />
                </div>
                <h2 className="mt-4 text-lg font-bold text-cmg-ink">พร้อมสร้าง bill JSON</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  เลือกรูปบิลหลายไฟล์จากแถบซ้าย แล้วกด Extract bills ระบบจะคืนหนึ่ง object ต่อหนึ่งรูป และให้แก้ไขตารางก่อนดาวน์โหลด.
                </p>
              </div>
            </div>
          ) : (
            bills.map((bill, index) => (
              <BillEditor
                key={`${bill.supplier_invoice_no}-${index}`}
                bill={bill}
                billIndex={index}
                validation={validation[index]}
                onChange={updateBill}
              />
            ))
          )}
        </section>

        <ValidationPanel bills={bills} validation={validation} onDownload={downloadJson} />
      </div>
    </main>
  );
}
