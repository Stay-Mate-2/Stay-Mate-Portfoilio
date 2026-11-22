import type { CSSProperties } from "react";

type Cube3DProps = {
  size?: number;
  variant?: "light" | "dark";
  reverse?: boolean;
  className?: string;
};

const FACE_TRANSFORMS = (half: number) => [
  `rotateY(0deg) translateZ(${half}px)`,
  `rotateY(180deg) translateZ(${half}px)`,
  `rotateY(90deg) translateZ(${half}px)`,
  `rotateY(-90deg) translateZ(${half}px)`,
  `rotateX(90deg) translateZ(${half}px)`,
  `rotateX(-90deg) translateZ(${half}px)`,
];

/**
 * Pure-CSS 6-face 3D translucent architectural prism rotating smoothly on the GPU.
 * Automatically freezes into a static isometric prism under prefers-reduced-motion.
 */
export function Cube3D({ size = 56, variant = "light", reverse = false, className = "" }: Cube3DProps) {
  const half = size / 2;
  const faces = FACE_TRANSFORMS(half);

  const faceStyle: CSSProperties =
    variant === "dark"
      ? {
          border: "1.5px solid rgb(107 180 255 / 0.42)",
          background:
            "linear-gradient(135deg, rgb(23 105 210 / 0.24) 0%, rgb(22 167 101 / 0.16) 100%)",
          boxShadow: "inset 0 0 16px rgb(107 180 255 / 0.16)",
        }
      : {
          border: "1.5px solid rgb(23 105 210 / 0.34)",
          background:
            "linear-gradient(135deg, rgb(23 105 210 / 0.15) 0%, rgb(22 167 101 / 0.12) 100%)",
          boxShadow: "inset 0 0 14px rgb(255 255 255 / 0.55)",
        };

  return (
    <div className={`cube-3d-scene pointer-events-none select-none ${className}`} aria-hidden="true">
      <div
        className={`cube-3d-mesh ${reverse ? "animate-spin-cube-3d-reverse" : "animate-spin-cube-3d"}`}
        style={{ "--cube-size": `${size}px` } as CSSProperties}
      >
        {/* Luminous core inside the rotating glass cube */}
        <span
          className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
          style={{
            background:
              variant === "dark"
                ? "radial-gradient(circle, #6bb4ff 0%, #16a765 70%, transparent 100%)"
                : "radial-gradient(circle, #1769d2 0%, #16a765 75%, transparent 100%)",
          }}
        />
        {faces.map((transform, i) => (
          <span
            key={i}
            className="cube-3d-face"
            style={{
              ...faceStyle,
              transform,
              borderColor:
                i % 2 === 1
                  ? variant === "dark"
                    ? "rgb(22 167 101 / 0.42)"
                    : "rgb(22 167 101 / 0.34)"
                  : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
