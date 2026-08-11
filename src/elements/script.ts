import { initCodeGroups } from "../client.js";
import type { ClassNames } from "../options.js";

export const getScript = (_classNames: ClassNames) =>
  `(${initCodeGroups.toString()})(document);`;
