import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { Metadata } from "next";
import Link from "next/link";
import { baseOptions } from "@/lib/layout.shared";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono text-sm text-fd-primary">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          This tab is empty
        </h1>
        <p className="mt-4 text-fd-muted-foreground">
          The page you were looking for doesn't exist or has moved.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="rounded-full border bg-fd-card px-5 py-2.5 text-sm font-medium hover:bg-fd-accent"
          >
            Home
          </Link>
          <Link
            href="/docs"
            className="rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground hover:bg-fd-primary/85"
          >
            Documentation
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}
