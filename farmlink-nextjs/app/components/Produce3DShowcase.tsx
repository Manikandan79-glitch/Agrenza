"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

interface CategoryItem {
  name: string;
  count: string;
  image: string;
  emoji: string;
}

const STALL_CATEGORIES: CategoryItem[] = [
  {
    name: "Vegetables",
    count: "40+ items",
    emoji: "🥦",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Fruits",
    count: "25+ items",
    emoji: "🍎",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Spices & Herbs",
    count: "20+ items",
    emoji: "🌶️",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Leafy Greens",
    count: "15+ items",
    emoji: "🥬",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tubers & Roots",
    count: "12+ items",
    emoji: "🥔",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Grains & Pulses",
    count: "18+ items",
    emoji: "🌾",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Produce3DShowcase() {
  const count = STALL_CATEGORIES.length;
  const radius = 300;
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartRotRef = useRef(0);

  /* ---- animation loop with intro burst ---- */
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const startTime = performance.now();
    const introMs = 2000;
    const introSpeed = 180;
    const normalSpeed = 22;

    function step(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!isPausedRef.current && !isDraggingRef.current) {
        const t = Math.min((now - startTime) / introMs, 1);
        const ease = t * t;
        const speed = introSpeed + (normalSpeed - introSpeed) * ease;
        rotationRef.current = (rotationRef.current + dt * speed) % 360;
        setRotation(rotationRef.current);
      }
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  /* ---- drag handlers ---- */
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = true;
    isPausedRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartRotRef.current = rotationRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    rotationRef.current = dragStartRotRef.current + delta * 0.4;
    setRotation(rotationRef.current);
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    isDraggingRef.current = false;
    isPausedRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  return (
    <section className="spin-section">
      {/* ---- header ---- */}
      <div className="spin-head">
        <p className="spin-eyebrow">Straight from the crate</p>
        <h2 className="spin-title">Spin the stall</h2>
        <p className="spin-lead">
          Drag to look around — every card is a category listed by local farmers.
        </p>
      </div>

      {/* ---- 3D wrapper ---- */}
      <div className="scene-wrapper">
        <div
          className="scene"
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="carousel"
            style={{ transform: `translateZ(${-radius}px) rotateY(${rotation}deg)` }}
          >
            {STALL_CATEGORIES.map((cat, i) => {
              const angle = (360 / count) * i;
              return (
                <Link
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  key={cat.name}
                  className="card"
                  style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)` }}
                >
                  <div className="card-img">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>
                  <span className="card-name">{cat.emoji} {cat.name}</span>
                  <span className="card-count">{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ---- Section ---- */
        .spin-section {
          padding: 30px 20px 60px;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        /* ---- Header ---- */
        .spin-head {
          margin-bottom: 24px;
          animation: fadeUp 0.7s ease-out both;
        }
        .spin-eyebrow {
          font-family: var(--font-mono, monospace);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.75rem;
          color: var(--rust, #c0622a);
          margin: 0 0 6px;
        }
        .spin-title {
          font-family: var(--font-display, serif);
          font-weight: 600;
          font-size: clamp(1.5rem, 3vw, 2rem);
          margin: 0 0 6px;
          color: var(--soil, #2c3a2a);
        }
        .spin-lead {
          color: #6b6555;
          font-size: 0.9rem;
          margin: 0;
        }

        /* ---- 3D wrapper provides perspective ---- */
        .scene-wrapper {
          perspective: 900px;
          perspective-origin: 50% 50%;
          overflow: visible;
        }

        /* ---- Scene: interaction area ---- */
        .scene {
          width: 100%;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          touch-action: pan-y;
          user-select: none;
          overflow: visible;
        }
        .scene:active {
          cursor: grabbing;
        }

        /* ---- Carousel ring ---- */
        .carousel {
          width: 120px;
          height: 180px;
          position: relative;
          transform-style: preserve-3d;
          animation: popIn 0.8s ease-out 0.2s both;
        }

        /* ---- Each card ---- */
        .card {
          position: absolute;
          top: 0;
          left: 0;
          width: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          color: inherit;
          backface-visibility: hidden;
        }
        .card-img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--paper, #faf8f3);
          box-shadow: 0 8px 20px rgba(22, 36, 26, 0.22);
          background: linear-gradient(160deg, #f7f2e6, #ede4cd);
          flex-shrink: 0;
        }
        .card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .card-name {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.03em;
          background: var(--soil, #2c3a2a);
          color: var(--paper, #faf8f3);
          padding: 2px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .card-count {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          color: var(--rust, #c0622a);
          font-weight: 600;
        }

        /* ---- Animations ---- */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6) translateZ(${-radius}px); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* ---- Responsive ---- */
        @media (max-width: 700px) {
          .scene { height: 220px; }
          .card-img { width: 80px; height: 80px; }
          .carousel { width: 100px; height: 150px; }
          .card { width: 100px; }
          .card-name { font-size: 0.6rem; padding: 2px 7px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .carousel, .spin-head { animation: none; }
        }
      `}</style>
    </section>
  );
}
