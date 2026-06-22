from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Sequence


@lru_cache(maxsize=1)
def get_ocr_engine() -> Any:
    try:
        from paddleocr import PaddleOCR
    except ImportError as exc:
        raise RuntimeError(
            "PaddleOCR is not installed. Install backend requirements or deploy the Docker backend."
        ) from exc

    # Product codes and totals are Latin/numeric. Thai labels help layout, but
    # table extraction should not depend on reading every Thai label perfectly.
    return PaddleOCR(
        use_angle_cls=True,
        lang="en",
        show_log=False,
        use_gpu=False,
    )


def run_ocr(image_path: Path) -> List[Dict[str, Any]]:
    engine = get_ocr_engine()
    raw_result = engine.ocr(str(image_path), cls=True)
    tokens: List[Dict[str, Any]] = []

    for line in flatten_paddle_result(raw_result):
        if len(line) < 2:
            continue
        box, text_meta = line[0], line[1]
        if not text_meta:
            continue
        text = str(text_meta[0]).strip()
        confidence = float(text_meta[1]) if len(text_meta) > 1 else 0.0
        if not text:
            continue

        xs = [float(point[0]) for point in box]
        ys = [float(point[1]) for point in box]
        x1, x2 = min(xs), max(xs)
        y1, y2 = min(ys), max(ys)
        tokens.append(
            {
                "text": text,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2],
                "cx": (x1 + x2) / 2,
                "cy": (y1 + y2) / 2,
                "width": x2 - x1,
                "height": y2 - y1,
            }
        )

    return tokens


def flatten_paddle_result(raw_result: Sequence[Any]) -> List[Any]:
    if not raw_result:
        return []
    if len(raw_result) == 1 and isinstance(raw_result[0], list):
        return raw_result[0]
    return list(raw_result)
