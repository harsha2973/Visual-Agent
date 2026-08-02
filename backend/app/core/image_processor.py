import io
from PIL import Image
from typing import Tuple, Dict, Any

def compress_and_thumbnail(
    image_bytes: bytes,
    quality: int = 75,
    max_dimension: int = 1920,
    thumbnail_size: Tuple[int, int] = (200, 200),
) -> Dict[str, Any]:
    """
    Reads image bytes, compresses main image, generates a thumbnail,
    and returns compressed bytes, thumbnail bytes, dimensions, and format.
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Convert RGBA / P modes to RGB for JPEG compatibility
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    orig_width, orig_height = image.size

    # Resize main image if larger than max_dimension
    if orig_width > max_dimension or orig_height > max_dimension:
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    # Save compressed main image
    output_buffer = io.BytesIO()
    image.save(output_buffer, format="JPEG", quality=quality, optimize=True)
    compressed_bytes = output_buffer.getvalue()

    # Create thumbnail
    thumb_image = image.copy()
    thumb_image.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
    thumb_buffer = io.BytesIO()
    thumb_image.save(thumb_buffer, format="JPEG", quality=60, optimize=True)
    thumbnail_bytes = thumb_buffer.getvalue()

    return {
        "compressed_bytes": compressed_bytes,
        "thumbnail_bytes": thumbnail_bytes,
        "width": orig_width,
        "height": orig_height,
        "format": "jpeg",
        "file_size": len(compressed_bytes),
    }
