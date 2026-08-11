import { emojify } from "node-emoji";
import type { LabelResolver } from "./options.js";

/** Resolve labels with the complete `node-emoji` shortcode catalog. */
export const fullEmojiResolver: LabelResolver = (label) => emojify(label);
