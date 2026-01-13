"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, PenTool } from "lucide-react";

interface SignaturePadProps {
  onSave: (base64: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SignaturePad({
  onSave,
  onClear,
  placeholder = "Assine aqui",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getCoordinates = (
    event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);

    // Prevent scrolling on touch
    if (event.cancelable) event.preventDefault();
  };

  const draw = (
    event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(event);
    ctx.lineTo(x, y);
    ctx.stroke();

    if ("cancelable" in event && event.cancelable) event.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onClear) onClear();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const base64 = canvas.toDataURL("image/png");
    onSave(base64);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fix blurry canvas on high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Update styles after resize
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Add global listeners for smoother drawing
    window.addEventListener("mouseup", stopDrawing);
    window.addEventListener("touchend", stopDrawing);

    return () => {
      window.removeEventListener("mouseup", stopDrawing);
      window.removeEventListener("touchend", stopDrawing);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative w-full aspect-[2/1] bg-white border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden touch-none">
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none opacity-50">
            <PenTool className="w-8 h-8 mb-2" />
            <span className="text-sm">{placeholder}</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={isEmpty}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Limpar
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isEmpty}
          className="text-xs"
        >
          Confirmar Assinatura
        </Button>
      </div>
    </div>
  );
}
