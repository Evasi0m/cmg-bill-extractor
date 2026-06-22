---
title: CMG Bill Extractor API
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

# Backend notes

Run the API locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Current extraction flow:

1. Save uploaded images to a temporary directory.
2. Preprocess the image with OpenCV.
3. Run PaddleOCR and collect text, bounding boxes, and confidence.
4. Parse CMG invoice fields from document coordinates.
5. Validate all bills deterministically.
