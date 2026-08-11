import rehypeCodeGroup, {
  commonLabelResolver,
  type RehypeCodeGroupOptions,
} from "rehype-code-group";
import {
  type CodeGroupChangeDetail,
  initCodeGroups,
} from "rehype-code-group/client";
import { fullEmojiResolver } from "rehype-code-group/emoji";
import remarkPackageManagers from "rehype-code-group/package-managers";
import remarkCodeGroup from "rehype-code-group/remark";
import "rehype-code-group/styles.css";

const options: RehypeCodeGroupOptions = {
  assets: "none",
  diagnostics: "error",
  labelResolver: commonLabelResolver,
};
const detail: CodeGroupChangeDetail = {
  index: 0,
  source: "keyboard",
  value: "npm",
};

void rehypeCodeGroup;
void remarkCodeGroup;
void remarkPackageManagers;
void fullEmojiResolver;
void initCodeGroups;
void options;
void detail;
