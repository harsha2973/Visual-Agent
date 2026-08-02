import { BoundingBox } from '@visual-agent/shared';

export async function redactAndCompressImage(
  dataUrl: string,
  sensitiveBoxes: BoundingBox[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('offscreen-canvas') as HTMLCanvasElement;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas context unavailable'));
      }

      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = '#000000';

      sensitiveBoxes.forEach((box) => {
        ctx.fillRect(box.x, box.y, box.width, box.height);
      });

      resolve(canvas.toDataURL('image/webp', 0.8));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
