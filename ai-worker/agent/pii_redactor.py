import base64
import io
from PIL import Image, ImageDraw
from typing import List, Dict, Any

class PIIRedactor:
    """Masks flagged PII bounding boxes on images prior to LLM submission."""

    def redact_image_base64(self, image_base64: str, boxes: List[Dict[str, float]]) -> str:
        if not image_base64 or not boxes:
            return image_base64

        try:
            # Strip header if present
            if "," in image_base64:
                header, image_base64 = image_base64.split(",", 1)
            else:
                header = "data:image/webp;base64"

            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            draw = ImageDraw.Draw(image)

            for box in boxes:
                x = box.get("x", 0)
                y = box.get("y", 0)
                w = box.get("width", 0)
                h = box.get("height", 0)
                draw.rectangle([x, y, x + w, y + h], fill="black")

            buffer = io.BytesIO()
            image.save(buffer, format="WEBP", quality=80)
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            return f"{header},{encoded}"
        except Exception as e:
            print(f"[PIIRedactor Error] Failed to redact image: {e}")
            return image_base64
