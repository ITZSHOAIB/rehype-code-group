import { notFound } from "next/navigation";
import { docsLlms, markdownUrl, source } from "@/lib/source";

export const revalidate = false;
export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/[...path]">,
) {
  const { path } = await params;
  const url = `/${path.join("/")}`;
  const page = source
    .getPages()
    .find((page) => markdownUrl(page.url) === `/llms.mdx${url}`);
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    path: markdownUrl(page.url).slice("/llms.mdx/".length).split("/"),
  }));
}
