"use client";

import { useRef, useState } from "react";
import { Tomato, Carrot, LeafyGreen, Chili } from "./ProduceIcons";

/**
 * Signature element: a stack of produce crates rendered with real CSS 3D
 * (perspective + preserve-3d + translateZ), tilted like an actual mandi
 * crate stack. The whole scene tracks the pointer for a subtle parallax —
 * on touch devices it settles into a fixed resting tilt instead.
 */
export default function CrateHero() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: -8, y: 14 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -8 - py * 14, y: 14 + px * 18 });
  }

  function handleLeave() {
    setTilt({ x: -8, y: 14 });
  }

  const crates = [
    { icon: <Tomato />, label: "Tomato", z: 40, x: -70, y: -10, rot: -6 },
    { icon: <Carrot />, label: "Carrot", z: 90, x: 40, y: 20, rot: 4 },
    { icon: <LeafyGreen />, label: "Spinach", z: 10, x: -20, y: 70, rot: -3 },
    { icon: <Chili />, label: "Chili", z: 130, x: 110, y: -50, rot: 8 },
  ];

  return (
    <div
      className="crate-scene-wrap"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="crate-scene" ref={sceneRef}>
        <div
          className="crate-stage"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          {crates.map((c) => (
            <div
              key={c.label}
              className="crate"
              style={{
                transform: `translate3d(${c.x}px, ${c.y}px, ${c.z}px) rotate(${c.rot}deg)`,
              }}
            >
              <div className="crate-box">
                {c.icon}
                <span className="crate-label">{c.label}</span>
              </div>
              <div className="crate-slats" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .crate-scene-wrap {
          perspective: 1400px;
          width: 100%;
          height: 100%;
          min-height: 340px;
        }
        .crate-scene {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }
        .crate-stage {
          position: relative;
          width: 220px;
          height: 220px;
          transform-style: preserve-3d;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          animation: stage-breathe 7s ease-in-out infinite;
        }
        .crate {
          position: absolute;
          top: 50%;
          left: 50%;
          margin: -46px 0 0 -46px;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          animation: crate-float 5s ease-in-out infinite;
        }
        .crate:nth-child(1) { animation-delay: -0.4s; }
        .crate:nth-child(2) { animation-delay: -2.1s; }
        .crate:nth-child(3) { animation-delay: -3.6s; }
        .crate:nth-child(4) { animation-delay: -1.2s; }
        @keyframes stage-breathe {
          0%, 100% { transform: translateZ(0); }
          50% { transform: translateZ(18px); }
        }
        @keyframes crate-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .crate-stage, .crate { animation: none; }
        }
        .crate-box {
          width: 92px;
          height: 92px;
          border-radius: 6px;
          background: linear-gradient(155deg, #c9925a, #a5713a);
          border: 2px solid #7a4f26;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          box-shadow: 0 22px 34px rgba(0, 0, 0, 0.45), inset 0 0 0 3px rgba(0, 0, 0, 0.08);
        }
        .crate-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #3c2611;
        }
        .crate-slats {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .crate-slats span {
          position: absolute;
          left: 6px;
          right: 6px;
          height: 2px;
          background: rgba(0, 0, 0, 0.15);
        }
        .crate-slats span:nth-child(1) { top: 22px; }
        .crate-slats span:nth-child(2) { top: 46px; }
        .crate-slats span:nth-child(3) { top: 70px; }
      `}</style>
    </div>
  );
}
