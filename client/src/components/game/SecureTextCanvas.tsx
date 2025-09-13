import React, { useEffect, useRef, useCallback } from "react";

interface SecureTextCanvasProps {
  text: string;
  className?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  textAlign?: CanvasTextAlign;
}

const DEFAULT_STYLES = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  fontSize: 20,
  fontWeight: "normal",
  color: "#FFFFFF",
  textAlign: "left" as CanvasTextAlign,
};

export const SecureTextCanvas: React.FC<SecureTextCanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { text, className, fontFamily, fontSize, fontWeight, color, textAlign } = { ...DEFAULT_STYLES, ...props };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const parentWidth = parent.clientWidth;
    // Guard Clause: If the parent has no width yet, do nothing.
    // The ResizeObserver will trigger a redraw once the layout is stable.
    if (parentWidth <= 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = font;

    // Increased line height for better readability
    const lineHeight = fontSize * 1.5;

    // --- Text Wrapping & Height Calculation ---
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > parentWidth && line.length > 0) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const calculatedHeight = lines.length * lineHeight;

    // Set canvas dimensions for high-resolution displays
    canvas.width = parentWidth * dpr;
    canvas.height = calculatedHeight * dpr;
    canvas.style.width = `${parentWidth}px`;
    canvas.style.height = `${calculatedHeight}px`;

    // Scale the context to ensure sharp text
    ctx.scale(dpr, dpr);

    // Set styles AGAIN after scaling/resizing
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.textAlign = textAlign;

    // Draw the lines of text
    let y = 0;
    for (const singleLine of lines) {
      let x = 0;
      if (textAlign === 'center') {
        x = parentWidth / 2;
      } else if (textAlign === 'right') {
        x = parentWidth;
      }
      ctx.fillText(singleLine.trim(), x, y);
      y += lineHeight;
    }
  }, [text, fontFamily, fontSize, fontWeight, color, textAlign]);

  // This effect handles both the initial draw and resizing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!parent) return;

    // Initial draw when component mounts or `draw` function changes
    draw();

    // Create an observer to redraw when the parent element resizes
    const resizeObserver = new ResizeObserver(() => {
        draw();
    });
    
    resizeObserver.observe(parent);

    // Cleanup: disconnect the observer when the component unmounts.
    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onDragStart={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      draggable={false}
      style={{ display: "block" }}
    />
  );
};