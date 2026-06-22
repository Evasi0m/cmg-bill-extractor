from pathlib import Path
from typing import Any, Dict, List


class OCRResult(dict):
    pass


def run_ocr(image_path: Path) -> List[Dict[str, Any]]:
    """OCR extension point.

    This MVP intentionally returns an empty OCR result. PaddleOCR or Surya can
    be wired here later while keeping the parser and validator untouched.
    """
    _ = image_path
    return []

