import "rehype-code-group/styles.css";

import type React from "react";
import { components } from "vocs/mdx";
import { CodeGroupEnhancer } from "./CodeGroupEnhancer.js";

export type CodeGroupPreviewItem = {
  code: string;
  label: string;
  lang?: string;
  note?: string;
  title?: string;
  value?: string;
};

type Props = {
  accessibleLabel?: string;
  agentSummary?: string;
  className?: string;
  defaultValue?: string;
  id: string;
  items: CodeGroupPreviewItem[];
  orientation?: "horizontal" | "vertical";
  persist?: "local" | "url";
  sync?: string;
};

type VocsCodeBlockProps = React.ComponentProps<"pre"> & {
  "data-title"?: string;
  "data-v-lang"?: string;
};

const VocsCodeBlock = components.pre as React.ComponentType<VocsCodeBlockProps>;

export function CodeGroupPreview({
  accessibleLabel = "Code examples",
  className,
  defaultValue,
  id,
  items,
  orientation = "horizontal",
  persist,
  sync,
}: Props) {
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => (item.value ?? item.label) === defaultValue),
  );

  return (
    <CodeGroupEnhancer>
      <div
        className={["rehype-code-group", className].filter(Boolean).join(" ")}
        data-rcg-orientation={
          orientation === "vertical" ? orientation : undefined
        }
        data-rcg-persist={persist}
        data-rcg-sync={sync}
      >
        <div
          aria-label={accessibleLabel}
          aria-orientation={orientation}
          className="rcg-tab-container"
          role="tablist"
        >
          {items.map((item, index) => (
            <button
              aria-controls={`${id}-panel-${index}`}
              aria-selected={index === selectedIndex}
              className={index === selectedIndex ? "rcg-tab active" : "rcg-tab"}
              data-rcg-value={item.value ?? item.label}
              id={`${id}-tab-${index}`}
              key={item.value ?? item.label}
              role="tab"
              tabIndex={index === selectedIndex ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        {items.map((item, index) => (
          <div
            aria-labelledby={`${id}-tab-${index}`}
            className={
              index === selectedIndex ? "rcg-block active" : "rcg-block"
            }
            data-rcg-label={item.label}
            id={`${id}-panel-${index}`}
            key={item.value ?? item.label}
            role="tabpanel"
          >
            {item.note ? <p>{item.note}</p> : null}
            <VocsCodeBlock
              data-title={item.title}
              data-v-lang={item.lang ?? "text"}
            >
              <code className={`language-${item.lang ?? "text"}`}>
                {item.code}
              </code>
            </VocsCodeBlock>
          </div>
        ))}
      </div>
    </CodeGroupEnhancer>
  );
}
