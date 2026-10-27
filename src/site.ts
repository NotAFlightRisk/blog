export const site = {
  name: 'Peng.ly Blog',
  url: 'https://blog.peng.ly',
  home: { name: 'Peng.ly', url: 'https://peng.ly' },
  author: {
    name: 'Iain',
    handle: 'NotAFlightRisk',
    url: 'https://peng.ly/about',
    github: 'https://github.com/NotAFlightRisk',
  },
  repo: 'https://github.com/NotAFlightRisk/blog',
  description: "Occasional posts about code, security, and whatever else I've been poking at",
  tagline: 'Writing about code, security and the odd penguin',
  lang: 'en-GB',
  locale: 'en_GB',
  // matches the yellow bar, so the browser's toolbar joins in
  color: '#febc20',
};

// the front page gets the newest few plus the featured ones, the rest live in the archive
export const latest = 2;
export const featured = 10;

export const nav = [
  { label: 'Archive', href: '/archive/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'Projects', href: 'https://peng.ly/projects' },
  { label: 'Contact', href: 'https://peng.ly/contact' },
];
