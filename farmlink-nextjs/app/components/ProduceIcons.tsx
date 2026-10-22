export function Tomato({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="27" rx="16" ry="14" fill="#C23616" />
      <ellipse cx="18" cy="22" rx="5" ry="4" fill="#E0532F" opacity="0.6" />
      <path d="M24 13c-2 0-3 3-3 3s-2-4-5-3c0 3 3 4 3 4s-4 1-4 4c3 1 5-1 5-1s0 3 2 4c1-2 1-4 1-4s2 2 4 1c0-3-3-3-3-3s3-1 3-4c-1 0-3-1-3-1z" fill="#4C7A3D" />
    </svg>
  );
}

export function Carrot({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M14 16c8-2 16 4 20 12-8 6-20 6-24-2-2-4-1-8 4-10z" fill="#E8A33D" />
      <path d="M16 15l-3-8m8 8l-1-9m8 10l2-8" stroke="#4C7A3D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function LeafyGreen({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 42c-10-2-16-12-14-24 10 0 18 6 18 16 0-10 8-16 18-16 2 12-4 22-14 24-2-6-6-6-8 0z" fill="#4C7A3D" />
      <path d="M24 42V22" stroke="#2F5124" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Chili({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M12 12c3-2 6-1 6 1 6-1 14 4 16 12 2 8-4 14-11 12-9-2-14-11-13-18 .3-2.5 1.2-5.5 2-7z" fill="#C23616" />
      <path d="M12 12c-1-2-1-4 1-5" stroke="#4C7A3D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
