import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { CodeGroups } from "@/components/code-groups";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      <CodeGroups />
      {children}
    </DocsLayout>
  );
}
