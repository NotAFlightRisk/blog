// Chromium readies a page once its link's hovered or pressed, so it opens straight away, and
// every page's address ends in a slash, which leaves the feed and the Markdown copies out.
// vercel.json trusts these by hash, so any edit needs the new hash there (the test says which)
export const speculationRules = JSON.stringify({
  prerender: [{ where: { href_matches: ['/', '/*/'] }, eagerness: 'moderate' }],
});
