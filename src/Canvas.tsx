import { inkColorAtom, canvasRefAtom } from "./atoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import { XIcon } from "lucide-react";
import { useDrawImageToCanvas, useSaveCanvasToLocalStorage } from "./hooks";
import { ImageUploader } from "./ImageUploader";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const w = 512;
  const h = 512;
  // store points and line color
  const pointsRef = useRef<
    { line: [number, number, number][]; color: string }[]
  >([]);
  const timeoutRef = useRef(-1);
  const [inkColor, setInkColor] = useAtom(inkColorAtom);
  const [canvasRefA] = useAtom(canvasRefAtom);
  const saveCanvasToLocalStorage = useSaveCanvasToLocalStorage();
  const drawImageToCanvas = useDrawImageToCanvas();

  function drawPoints() {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      for (const points of pointsRef.current!) {
        ctx.fillStyle = points.color;
        const outlinePoints: [number, number, number][] = getStroke(
          points.line,
          {
            size: 4,
            simulatePressure: false,
          }
        ) as [number, number, number][];
        const pathData = getSvgPathFromStroke(outlinePoints);
        const path = new Path2D(pathData);
        ctx.fill(path);
      }
    }
  }

  function resetTimeout() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      saveCanvasToLocalStorage();
    }, 1000);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    const bounds = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    pointsRef.current.push({ line: [[x, y, 1]], color: inkColor });
    drawPoints();
    resetTimeout();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.buttons !== 1) return;
    e.preventDefault();
    const bounds = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const currentPoints = pointsRef.current[pointsRef.current.length - 1].line;
    currentPoints.push([x, y, 1]);
    drawPoints();
    resetTimeout();
  }

  useEffect(() => {
    // load from localStorage
    const prevCanvas = localStorage.getItem("canvas");
    if (prevCanvas) {
      drawImageToCanvas(prevCanvas);
    }
  }, [drawImageToCanvas]);

  useEffect(() => {
    canvasRefA.current = canvasRef.current;
  }, [canvasRefA]);

  return (
    <div className="">
      <div className="bg-white border border-black">
        <canvas
          className="block cursor-crosshair touch-none"
          ref={canvasRef}
          width={w}
          height={h}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        />
        <div className="flex border-t border-black justify-between">
          <div className="flex">
            <div className="flex gap-1 items-center border-r border-black">
              <ImageUploader />
            </div>
            <div className="flex gap-1 items-center border-r border-black">
              <button
                className="text-sm flex gap-1 items-center px-2 py-2 hover:bg-neutral-100"
                onClick={() => {
                  const c = canvasRef.current!;
                  const ctx = c.getContext("2d")!;
                  ctx.clearRect(0, 0, w, h);
                  pointsRef.current = [];
                  saveCanvasToLocalStorage();
                }}
              >
                <XIcon size={14} /> Clear Canvas
              </button>
            </div>
          </div>
          <div className="flex">
            <div className="flex gap-1 items-center px-2 py-1 border-l border-black">
              <label className="text-sm cursor-pointer" htmlFor="color">
                Ink color:
              </label>
              <input
                className="cursor-pointer"
                id="color"
                type="color"
                value={inkColor}
                onChange={(e) => {
                  setInkColor(e.currentTarget.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
