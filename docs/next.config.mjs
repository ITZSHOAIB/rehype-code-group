import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  // Every page is written as `<route>/index.html`, which any static host serves
  // at `/<route>/` without rewrites.
  trailingSlash: true,
  reactStrictMode: true,
};

export default withMDX(config);
