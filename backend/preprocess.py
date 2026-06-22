from pathlib import Path


def preprocess_image(image_path: Path) -> Path:
    """Placeholder for OpenCV preprocessing.

    Future implementation:
    - crop document boundaries
    - deskew
    - threshold / denoise / sharpen
    - export normalized image for OCR
    """
    return image_path

