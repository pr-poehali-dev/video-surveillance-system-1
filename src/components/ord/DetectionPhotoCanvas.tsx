import { useEffect, useRef } from 'react';

interface DetectionPhotoCanvasProps {
  src: string;
  lines: string[];
  className?: string;
}

export const DetectionPhotoCanvas = ({ src, lines, className }: DetectionPhotoCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = (img: HTMLImageElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const fontSize = Math.max(11, Math.round(canvas.width / 20));
      const lineHeight = fontSize * 1.35;
      const padding = fontSize * 0.6;
      const overlayHeight = lines.length * lineHeight + padding * 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      lines.forEach((line, i) => {
        ctx.fillText(line, padding, canvas.height - overlayHeight + padding + i * lineHeight);
      });
    };

    const imgCors = new Image();
    imgCors.crossOrigin = 'anonymous';
    imgCors.onload = () => draw(imgCors);
    imgCors.onerror = () => {
      const imgPlain = new Image();
      imgPlain.onload = () => draw(imgPlain);
      imgPlain.src = src;
    };
    imgCors.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, JSON.stringify(lines)]);

  return <canvas ref={canvasRef} className={className} />;
};

export default DetectionPhotoCanvas;
