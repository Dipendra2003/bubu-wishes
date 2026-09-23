import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  life: number;
  maxLife: number;
}

const HEART_COLORS = [
  '#f472b6', // pink-400
  '#fb7185', // rose-400
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#fda4af', // rose-300
  '#f9a8d4', // pink-300
  '#be185d', // pink-700
  '#e11d48', // rose-600
  '#fecdd3', // rose-100
  '#a78bfa', // violet-400
  '#fbbf24', // amber-400
  '#f87171', // red-400
];

const MAX_PARTICLES = 60;
const SPAWN_RATE = 3; // particles per frame when moving

export default function HeartCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number>(0);
  const isMovingRef = useRef(false);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const drawHeart = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color: string, opacity: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    ctx.beginPath();
    const s = size;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Subtle inner highlight
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.25);
    ctx.bezierCurveTo(-s * 0.3, -s * 0.05, -s * 0.45, s * 0.15, -s * 0.15, s * 0.55);
    ctx.globalAlpha = opacity * 0.3;
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    ctx.restore();
  }, []);

  const spawnParticle = useCallback((x: number, y: number) => {
    const particles = particlesRef.current;
    
    if (particles.length >= MAX_PARTICLES) {
      // Recycle oldest particle
      const oldest = particles.reduce((min, p, i, arr) => p.life > arr[min].life ? i : min, 0);
      const p = particles[oldest];
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 3;
      p.vy = -(Math.random() * 2 + 1.5); // antigravity: float UP
      p.size = Math.random() * 10 + 6;
      p.opacity = 0.8 + Math.random() * 0.2;
      p.rotation = (Math.random() - 0.5) * 0.8;
      p.rotationSpeed = (Math.random() - 0.5) * 0.08;
      p.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
      p.life = 0;
      p.maxLife = 60 + Math.random() * 40;
    } else {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 2 + 1.5),
        size: Math.random() * 10 + 6,
        opacity: 0.8 + Math.random() * 0.2,
        rotation: (Math.random() - 0.5) * 0.8,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      isMovingRef.current = true;

      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(() => {
        isMovingRef.current = false;
      }, 100);
    };

    // Also support touch for mobile
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isMovingRef.current = true;

        if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
        moveTimerRef.current = setTimeout(() => {
          isMovingRef.current = false;
        }, 100);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const { x: px, y: py } = prevMouseRef.current;

      // Spawn hearts when moving
      if (isMovingRef.current) {
        const dx = mx - px;
        const dy = my - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const spawnCount = Math.min(SPAWN_RATE, Math.max(1, Math.floor(dist / 8)));

        for (let i = 0; i < spawnCount; i++) {
          const t = i / spawnCount;
          const sx = px + dx * t + (Math.random() - 0.5) * 12;
          const sy = py + dy * t + (Math.random() - 0.5) * 12;
          spawnParticle(sx, sy);
        }
      }

      prevMouseRef.current = { x: mx, y: my };

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Antigravity: float upward, drift sideways with sinusoidal wobble
        p.vy -= 0.02; // continuous upward acceleration (antigravity!)
        p.vx += Math.sin(p.life * 0.05) * 0.03; // gentle side wobble
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out based on life
        const lifeRatio = p.life / p.maxLife;
        p.opacity = Math.max(0, (1 - lifeRatio) * 0.85);

        // Scale down near end of life
        const scale = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
        const currentSize = p.size * scale;

        if (p.life >= p.maxLife || p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawHeart(ctx, p.x, p.y, currentSize, p.rotation, p.color, p.opacity);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    };
  }, [drawHeart, spawnParticle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
