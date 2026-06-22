# CMG Bill JSON Extractor for TIMES POS

Web app for extracting CMG / Central Trading Co., Ltd. tax invoice images into the TIMES POS bill JSON schema.

## Structure

```text
cmg-bill-extractor/
├─ frontend/
│  ├─ app/
│  ├─ components/
│  └─ package.json
├─ backend/
│  ├─ main.py
│  ├─ ocr.py
│  ├─ preprocess.py
│  ├─ cmg_parser.py
│  ├─ validator.py
│  ├─ schema.py
│  └─ requirements.txt
└─ README.md
```

## Run

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## GitHub Pages + OCR backend

GitHub Pages can host only the static Next.js frontend. It cannot run the
FastAPI backend, so production extraction requires a deployed OCR backend.

Recommended free backend target: Hugging Face Spaces Docker SDK.

1. Create a Hugging Face write token.
2. Add GitHub repository secret `HF_TOKEN`.
3. Run the `Deploy Backend to Hugging Face Space` workflow.

That workflow creates/updates the Space, sets `NEXT_PUBLIC_API_URL`
automatically, and triggers the GitHub Pages workflow again.

Local development can call a local backend by setting:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## Behavior

- Upload multiple PNG/JPG images.
- One uploaded image becomes one bill object.
- The backend OCR returns bills in the target schema plus validation metadata for the UI.
- The Download JSON button exports only:

```json
{
  "bills": []
}
```

No date, PO, customer, barcode, or other extra fields are included in the exported JSON.

## OCR pipeline

The backend uses OpenCV preprocessing, PaddleOCR text detection/recognition,
and a CMG coordinate parser for:

- top-right `เลขที่:` invoice box
- product table `รายการสินค้า`, `จำนวน`, `ราคาต่อหน่วย`, `จำนวนเงิน`
- footer totals `ราคารวม`, `ราคาหลังหักส่วนลด`, `บวก VAT 7%`, `จำนวนเงินรวม`

If OCR confidence is low, fields are missing, or validation fails, suspicious
rows are marked with `needs_review=true`. The production path does not invent
items from filenames.
