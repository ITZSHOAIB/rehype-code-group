// Hosts such as Astro run smartypants before rehype, curling straight quotes
// into typographic pairs. Accept both forms so quoted values survive.
const closingQuotes: Record<string, string> = {
  '"': '"',
  "'": "'",
  "“": "”",
  "‘": "’",
};

/** Return the closing quote for an opening quote, or undefined if it is not one. */
export const closingQuoteFor = (character: string | undefined) =>
  character === undefined ? undefined : closingQuotes[character];
