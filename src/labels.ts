import type { LabelResolver } from "./options.js";

const commonEmoji: Record<string, string> = {
  package: "📦",
  robot: "🤖",
  rocket: "🚀",
  sparkles: "✨",
  yarn: "🧶",
};

/** Resolve a small, dependency-free set of common label emoji shortcodes. */
export const commonLabelResolver: LabelResolver = (label) =>
  label.replace(/:([a-z0-9_+-]+):/gi, (shortcode, name: string) => {
    return commonEmoji[name] ?? shortcode;
  });
