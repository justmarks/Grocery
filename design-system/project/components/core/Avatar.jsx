import React from "react";

// Deterministic warm-palette pick from a name, so each household
// member keeps a stable color across sessions.
const AVATAR_BGS = [
  "var(--tomato-500)",
  "var(--olive-500)",
  "var(--saffron-500)",
  "var(--plum-500)",
  "var(--sky-700)",
  "var(--cocoa-700)",
];

function hashName(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Round household-member avatar. Renders a photo when `src` is given,
 * otherwise initials on a deterministic warm-palette disc.
 */
export function Avatar({ name, src, size = 32, className = "", style, ...rest }) {
  const bg = AVATAR_BGS[hashName(name) % AVATAR_BGS.length];
  return (
    <span
      className={["gr-avatar", className].join(" ")}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: src ? "var(--paper-300)" : bg,
        ...style,
      }}
      title={name}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
