import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { absoluteUrl, appName, ogImage, sourceFileUrl } from "@/lib/shared";
import { source, markdownUrl as toMarkdownUrl } from "@/lib/source";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = toMarkdownUrl(page.url);
  const githubUrl = sourceFileUrl(page.path);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      // Fumadocs renders the table of contents in a plain <div>. Make it a
      // landmark so its links aren't outside every landmark region.
      tableOfContent={{
        container: { role: "navigation", "aria-labelledby": "toc-title" },
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <EditOnGitHub href={githubUrl} />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const url = absoluteUrl(page.url);
  // Next replaces, rather than merges, nested metadata objects, so every
  // page restates its Open Graph and Twitter images.
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: appName,
      url,
      title: page.data.title,
      description: page.data.description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: [ogImage.url],
    },
  };
}
