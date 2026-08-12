import { createReadStream, readFile, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "../../docs/dist/public");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const relativePath = pathname.endsWith("/")
    ? `${pathname}index.html`
    : pathname;
  const filePath = resolve(root, `.${relativePath}`);

  if (!filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    if (!statSync(filePath).isFile()) throw new Error("Not a file");
    const contentType =
      contentTypes[extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, { "content-type": contentType });

    if (extname(filePath) === ".html") {
      readFile(filePath, "utf8", (error, html) => {
        if (error) {
          response.destroy(error);
          return;
        }
        response.end(
          html.replaceAll(
            /<base href="[^"]*"\s*\/>/g,
            '<base href="http://127.0.0.1:4321"/>',
          ),
        );
      });
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(4321, "127.0.0.1");
