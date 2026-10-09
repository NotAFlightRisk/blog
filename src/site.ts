export const site = {
  name: 'Peng.ly Blog',
  url: 'https://blog.peng.ly',
  home: { name: 'Peng.ly', url: 'https://peng.ly' },
  author: { name: 'Iain', handle: 'NotAFlightRisk', url: 'https://peng.ly/about' },
  repo: 'https://github.com/NotAFlightRisk/blog',
  description: "Occasional posts about code, security, and whatever else I've been poking at",
  lang: 'en-GB',
  locale: 'en_GB',
  // matches the yellow bar, so the browser's toolbar joins in
  color: '#febc20',
};

// the posts that make the front page, the rest live in the archive
export const latest = 10;

export const nav = [
  { label: 'Archive', href: '/archive/' },
  { label: 'Tags', href: '/tags/' },
];
