from pathlib import Path

import cv2


def preprocess_image(image_path: Path) -> Path:
    image = cv2.imread(str(image_path))
    if image is None:
        return image_path

    max_side = max(image.shape[:2])
    if max_side > 2200:
        scale = 2200 / max_side
        image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray, h=7)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    sharpened = cv2.addWeighted(enhanced, 1.35, cv2.GaussianBlur(enhanced, (0, 0), 1.2), -0.35, 0)

    output_path = image_path.with_name(f"{image_path.stem}_normalized.png")
    cv2.imwrite(str(output_path), sharpened)
    return output_path
