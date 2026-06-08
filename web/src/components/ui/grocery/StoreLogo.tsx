import { Avatar } from "../core/Avatar";

export interface StoreLogoProps {
  /** Store name — drives the monogram fallback + alt text. */
  name: string;
  /** Uploaded logo data URL. When absent, a monogram disc shows. */
  logo?: string | null;
  /** Diameter in px. Default 40. */
  size?: number;
}

/**
 * A store's visual mark: the uploaded logo when one exists, otherwise
 * a monogram disc (the design system's initials-on-warm-disc pattern,
 * shared with member avatars). Logos are "contained" on a white disc
 * so wordmark / non-square logos keep their aspect ratio.
 */
export function StoreLogo({ name, logo, size = 40 }: StoreLogoProps) {
  if (logo) {
    return (
      <span
        title={name}
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-pill)",
          background: "var(--bg-card)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flex: "none",
        }}
      >
        <img
          src={logo}
          alt={name}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </span>
    );
  }
  return <Avatar name={name} size={size} />;
}
