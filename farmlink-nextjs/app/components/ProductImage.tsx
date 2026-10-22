"use client";

import { useState } from "react";
import { Tomato, Carrot, LeafyGreen, Chili } from "./ProduceIcons";
import { ProduceIcon } from "@/app/lib/types";

const ICONS = { tomato: Tomato, carrot: Carrot, leafy: LeafyGreen, chili: Chili };

/**
 * Renders a real product photo, falling back to the hand-drawn produce
 * icon (same one used everywhere else) if the image URL 404s or is
 * missing — so a broken/removed photo never breaks the layout.
 */
export default function ProductImage({
  src,
  icon,
  alt,
  iconSize = 54,
}: {
  src?: string;
  icon: ProduceIcon;
  alt: string;
  iconSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[icon];

  if (!src || failed) {
    return (
      <div className="pi-fallback">
        <Icon size={iconSize} />
        <style jsx>{`
          .pi-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="pi-photo"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}
