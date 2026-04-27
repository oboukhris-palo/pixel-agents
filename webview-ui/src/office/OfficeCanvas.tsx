/**
 * Office Canvas Component
 * 
 * React component that integrates canvas renderer and game loop.
 * Handles lifecycle management, zoom controls, and pan interactions.
 */

import { useEffect, useRef, useCallback } from 'react';
import { CanvasRenderer } from './engine/canvasRenderer';
import { startGameLoop } from './engine/gameLoop';
import { loadDefaultLayout } from './layout/layoutLoader';
import { createAgentSprite } from './sprites/spriteTypes';
import type { AgentStatus } from './sprites/spriteTypes';
import styles from './OfficeCanvas.module.css';

/** Agent team layout entry from JSON config. */
interface AgentAssignment {
  agentId: string;
  deskPosition: { x: number; y: number };
  color: string;
}

export interface OfficeCanvasProps {
  width?: number;
  height?: number;
  /** Optional pre-loaded agent assignments (for testability). */
  agentAssignments?: AgentAssignment[];
}

export function OfficeCanvas({ width = 960, height = 246, agentAssignments = [] }: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Initialize sprites from agent assignments
  const initSprites = useCallback((renderer: CanvasRenderer) => {
    const engine = renderer.getAnimationEngine();
    for (const agent of agentAssignments) {
      const sprite = createAgentSprite(
        `sprite-${agent.agentId}`,
        agent.agentId,
        agent.deskPosition.x,
        agent.deskPosition.y,
        agent.color,
      );
      engine.addSprite(sprite);
    }
  }, [agentAssignments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Load layout and initialize renderer
      const layout = loadDefaultLayout();
      const renderer = new CanvasRenderer(canvas, layout);
      renderer.autoFit();
      rendererRef.current = renderer;

      // Initialize agent sprites
      initSprites(renderer);

      // Start game loop with animation engine update
      const stopLoop = startGameLoop(canvas, {
        update: (_dt: number) => {
          renderer.getAnimationEngine().update(performance.now());
        },
        render: (_ctx: CanvasRenderingContext2D) => {
          renderer.render();
        },
      });

      return () => {
        stopLoop();
        rendererRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize office canvas:', error);
    }
  }, [initSprites]);

  // Listen for agent activity messages from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg?.type !== 'activity-update' || !rendererRef.current) return;
      const engine = rendererRef.current.getAnimationEngine();
      const spriteId = `sprite-${msg.agentId}`;
      const sprite = engine.getSprite(spriteId);
      if (!sprite) return;
      engine.applyAgentStatus(spriteId, msg.status as AgentStatus, performance.now(), msg.targetX, msg.targetY);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
