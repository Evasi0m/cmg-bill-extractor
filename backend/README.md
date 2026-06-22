# Backend notes

Run the API locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Current MVP extraction flow:

1. Save uploaded images to a temporary directory.
2. Call `preprocess_image()` as the OpenCV extension point.
3. Call `run_ocr()` as the PaddleOCR/Surya extension point.
4. Call `parse_cmg_bill()` for CMG coordinate parsing.
5. Validate all bills deterministically.

