/**
 * Office Canvas Component
 * 
 * React component that integrates canvas renderer and game loop.
 * Handles lifecycle management, zoom controls, and pan interactions.
 */

import { useEffect, useRef } from 'react';
import { CanvasRenderer } from './engine/canvasRenderer';
import { startGameLoop } from './engine/gameLoop';
import { loadDefaultLayout } from './layout/layoutLoader';
import styles from './OfficeCanvas.module.css';

export interface OfficeCanvasProps {
  width?: number;
  height?: number;
}

export function OfficeCanvas({ width = 960, height = 246 }: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Load layout and initialize renderer
      const layout = loadDefaultLayout();
      const renderer = new CanvasRenderer(canvas, layout);
      renderer.autoFit();
      rendererRef.current = renderer;

      // Start game loop using existing pattern
      const stopLoop = startGameLoop(canvas, {
        update: (_dt: number) => {
          // Update logic (currently none needed)
        },
        render: (_ctx: CanvasRenderingContext2D) => {
          // Render using our renderer
          renderer.render();
        },
      });

      return () => {
        // Cleanup on unmount
        stopLoop();
        rendererRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize office canvas:', error);
    }
  }, []);

  // Handle zoom via scroll wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      rendererRef.current?.setZoom(factor);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Handle pan via drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      let lastX = e.clientX;
      let lastY = e.clientY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - lastX;
        const deltaY = moveEvent.clientY - lastY;
        
        rendererRef.current?.setPan(deltaX, deltaY);
        
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={width}
        height={height}
        role="img"
        aria-label="Office visualization with agent sprites and furniture"
      />
    </div>
  );
}
