// A small static server for the exported site, used by `docs:preview` and the
// docs browser tests. It mirrors how Cloudflare Pages serves the output:
// `/route/` maps to `route/index.html`, `/route` redirects to `/route/`, and
// unknown paths get `404.html` with a 404 status.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    dir: { type: "string", default: "dist/public" },
    port: { type: "string", default: "4321" },
    host: { type: "string", default: "127.0.0.1" },
    quiet: { type: "boolean", default: false },
  },
});

const root = resolve(values.dir);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const isFile = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

const send = (response, status, filePath) => {
  response.writeHead(status, {
    "content-type":
      contentTypes[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  const filePath = resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (!pathname.endsWith("/") && (await isFile(filePath))) {
    send(response, 200, filePath);
    return;
  }
  if (await isFile(join(filePath, "index.html"))) {
    if (!pathname.endsWith("/")) {
      response.writeHead(308, { location: `${url.pathname}/${url.search}` });
      response.end();
      return;
    }
    send(response, 200, join(filePath, "index.html"));
    return;
  }

  if (!values.quiet) console.warn(`404 ${pathname}`);
  send(response, 404, join(root, "404.html"));
});

server.listen(Number(values.port), values.host, () => {
  console.log(`Serving ${root} at http://${values.host}:${values.port}/`);
});
