import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DrawingCanvasProps {
  guideChar: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ guideChar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const initContext = (ctx: CanvasRenderingContext2D) => {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#4f46e5'; // indigo-600
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Handle resizing and initial sizing with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        // Don't resize if size is 0
        if (width === 0 || height === 0) return;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) initContext(ctx);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Clear canvas when guideChar changes
  useEffect(() => {
    clear();
  }, [guideChar, clear]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    
    // Draw a point for short taps
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12rem] text-slate-100 font-kana opacity-60 leading-none">{guideChar}</span>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 cursor-crosshair touch-none z-10"
      />

      <button 
        onClick={clear}
        className="absolute bottom-4 right-4 p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-20 shadow-sm"
        aria-label="Clear canvas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};