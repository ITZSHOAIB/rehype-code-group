import { describe, expect, it, vi } from "vitest";
import { getNpmDownloads } from "../docs/lib/npm-stats";

const snapshot = {
  package: "rehype-code-group",
  downloads: 42852,
  start: "2026-10-17",
  end: "2026-11-15",
};

describe("hero npm download snapshot", () => {
  it("preserves npm's count and reporting dates", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(snapshot));
    await expect(getNpmDownloads(fetcher)).resolves.toEqual({
      downloads: 42852,
      start: snapshot.start,
      end: snapshot.end,
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.npmjs.org/downloads/point/last-month/rehype-code-group",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("omits the optional stat on network errors and HTTP failures", async () => {
    const offline = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("offline"));
    const unavailable = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("", { status: 503 }));
    await expect(getNpmDownloads(offline)).resolves.toBeNull();
    await expect(getNpmDownloads(unavailable)).resolves.toBeNull();
  });

  it.each([
    { ...snapshot, downloads: -1 },
    { ...snapshot, downloads: "42852" },
    { ...snapshot, package: "another-package" },
    { ...snapshot, start: "2026-02-30" },
    { ...snapshot, end: "2026-11-16" },
    null,
  ])("does not publish malformed or mismatched data: %j", async (data) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(data));
    await expect(getNpmDownloads(fetcher)).resolves.toBeNull();
  });
});
