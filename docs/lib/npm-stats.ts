type NpmDownloads = {
  downloads: number;
  start: string;
  end: string;
};

const endpoint =
  "https://api.npmjs.org/downloads/point/last-month/rehype-code-group";

/** Server-only caller: static export embeds this snapshot; browsers never fetch npm. */
export async function getNpmDownloads(
  fetcher: typeof fetch = fetch,
): Promise<NpmDownloads | null> {
  try {
    const response = await fetcher(endpoint, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      typeof data !== "object" ||
      data === null ||
      !("package" in data) ||
      data.package !== "rehype-code-group" ||
      !("downloads" in data) ||
      !Number.isSafeInteger(data.downloads) ||
      typeof data.downloads !== "number" ||
      data.downloads < 0 ||
      !("start" in data) ||
      !("end" in data)
    )
      return null;
    const validDate = (value: unknown): value is string =>
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value;
    if (!validDate(data.start) || !validDate(data.end)) return null;
    const days = (Date.parse(data.end) - Date.parse(data.start)) / 86400000 + 1;
    if (days !== 30) return null;
    return { downloads: data.downloads, start: data.start, end: data.end };
  } catch {
    // npm is optional: a network failure must not prevent publishing the docs.
    return null;
  }
}
