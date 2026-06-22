# CMG Bill JSON Extractor for TIMES POS

MVP web app for extracting CMG / Central Trading Co., Ltd. tax invoice images into the TIMES POS bill JSON schema.

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

## GitHub Pages

GitHub Pages can host only the static Next.js frontend. It cannot run the
FastAPI backend, so the deployed Pages build uses the browser-side extractor
unless a backend URL is configured.

To connect a deployed FastAPI backend later, add this repository variable:

```text
NEXT_PUBLIC_API_URL=https://your-backend.example.com
```

Then rerun the `Deploy GitHub Pages` workflow. Local development still calls
the FastAPI backend at `http://localhost:8000` by default.

## MVP behavior

- Upload multiple PNG/JPG images.
- One uploaded image becomes one bill object.
- The backend returns bills in the target schema plus validation metadata for the UI.
- The Download JSON button exports only:

```json
{
  "bills": []
}
```

No date, PO, customer, barcode, or other extra fields are included in the exported JSON.

## OCR integration path

`backend/ocr.py` is intentionally stubbed. Plug PaddleOCR or Surya into `run_ocr()` and return text tokens with bounding boxes. Then replace the fixture logic in `backend/cmg_parser.py` with coordinate-based extraction for:

- top-right `เลขที่:` invoice box
- product table `รายการสินค้า`, `จำนวน`, `ราคาต่อหน่วย`, `จำนวนเงิน`
- footer totals `ราคารวม`, `ราคาหลังหักส่วนลด`, `บวก VAT 7%`, `จำนวนเงินรวม`
