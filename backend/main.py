from pathlib import Path
from tempfile import TemporaryDirectory
from typing import List
import os

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from cmg_parser import parse_cmg_bill
from ocr import run_ocr
from preprocess import preprocess_image
from schema import ExtractionResponse
from validator import validate_bill


app = FastAPI(title="CMG Bill JSON Extractor API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,https://evasi0m.github.io",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "cmg-bill-extractor-api"}


@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_bills(files: List[UploadFile] = File(...)) -> ExtractionResponse:
    bills = []
    validation = []

    with TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        for bill_index, upload in enumerate(files):
            image_path = tmp_path / Path(upload.filename or f"bill-{bill_index}.png").name
            image_path.write_bytes(await upload.read())

            normalized_image = preprocess_image(image_path)
            ocr_tokens = run_ocr(normalized_image)
            bill = parse_cmg_bill(normalized_image, ocr_tokens)
            result = validate_bill(
                bill,
                bill_index=bill_index,
                expected_product_rows=len(bill.items),
            )

            bills.append(bill)
            validation.append(result)

    return ExtractionResponse(bills=bills, validation=validation)
