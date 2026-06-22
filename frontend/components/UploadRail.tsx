"use client";

import { FileImage, Loader2, UploadCloud, X } from "lucide-react";
import type { UploadedImage } from "./types";

type UploadRailProps = {
  images: UploadedImage[];
  isLoading: boolean;
  onFiles: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  onExtract: () => void;
};

export function UploadRail({ images, isLoading, onFiles, onRemove, onExtract }: UploadRailProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-cmg-line bg-white">
      <div className="border-b border-cmg-line px-5 py-4">
        <h2 className="text-sm font-semibold text-cmg-ink">Upload invoices</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">รองรับ PNG/JPG หลายไฟล์ โดยหนึ่งรูปจะถูกแยกเป็นหนึ่ง bill.</p>
      </div>

      <label
        className="m-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-cmg-soft px-4 py-7 text-center transition hover:border-cmg-red hover:bg-red-50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFiles(event.dataTransfer.files);
        }}
      >
        <UploadCloud className="text-cmg-red" size={28} />
        <span className="mt-3 text-sm font-semibold text-slate-800">Drag files here</span>
        <span className="mt-1 text-xs text-slate-500">or click to browse</span>
        <input
          multiple
          accept="image/png,image/jpeg"
          className="sr-only"
          type="file"
          onChange={(event) => event.target.files && onFiles(event.target.files)}
        />
      </label>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        {images.length === 0 ? (
          <div className="rounded-lg border border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
            ยังไม่มีรูปบิลที่เลือก
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="relative aspect-[3/4] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={image.name} className="h-full w-full object-cover" src={image.url} />
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  <FileImage className="shrink-0 text-slate-400" size={16} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-700">{image.name}</div>
                    <div className="text-[11px] text-slate-500">Bill {index + 1}</div>
                  </div>
                  <button
                    aria-label="Remove image"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    type="button"
                    onClick={() => onRemove(image.id)}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-cmg-line p-5">
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cmg-red px-4 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={images.length === 0 || isLoading}
          type="button"
          onClick={onExtract}
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
          Extract bills
        </button>
      </div>
    </aside>
  );
}

