import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Logo } from "@/components/logo";
import { appName, npmUrl, repoUrl } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2 font-display text-[0.95rem] font-semibold tracking-tight">
          <Logo className="size-6" />
          {appName}
        </span>
      ),
    },
    githubUrl: repoUrl,
    links: [
      { text: "Docs", url: "/docs", active: "nested-url" },
      { text: "npm", url: npmUrl, external: true },
    ],
  };
}
