"use client";
// The plugin runs with `assets: "none"`, so the site ships the browser client
// and stylesheet itself. The client delegates events from `document` and
// watches for inserted groups, so tabs keep working across soft navigation
// without being initialized again.
import "rehype-code-group/client";
import "rehype-code-group/styles.css";

export function CodeGroups() {
  return null;
}
