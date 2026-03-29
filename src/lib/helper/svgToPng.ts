export const convertSvgUrlToPng = (
  url: string,
  width: number = 80,
  height: number = 80,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // CRITICAL: This allows the canvas to "read" the image from a different domain
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const pngUrl = canvas.toDataURL('image/png');
        resolve(pngUrl);
      } catch (err) {
        reject(
          new Error('CORS/Tainted Canvas error: ' + (err as Error).message),
        );
      }
    };
    console.log(img);

    img.onerror = () => reject(new Error('Failed to load SVG from URL'));
    img.src = url;
  });
};
