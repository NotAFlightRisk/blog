export const site = {
  name: 'Peng.ly Blog',
  url: 'https://blog.peng.ly',
  home: { name: 'Peng.ly', url: 'https://peng.ly' },
  author: {
    name: 'Iain',
    handle: 'NotAFlightRisk',
    url: 'https://peng.ly/about',
    github: 'https://github.com/NotAFlightRisk',
    dev: 'https://dev.to/notaflightrisk',
    mastodon: 'https://mastodon.social/@NotAFlightRisk',
    fediverse: '@NotAFlightRisk@mastodon.social',
  },
  repo: 'https://github.com/NotAFlightRisk/blog',
  feed: '/rss.xml',
  // public on purpose, search engines fetch it back from /<key>.txt to check it's us
  indexnow: '28ea5ead22ef65098bb32a3b1d701fec',
  description: "Occasional posts about code, security, and whatever else I've been poking at",
  tagline: 'Writing about code, security and the odd penguin',
  lang: 'en-GB',
  locale: 'en_GB',
  // matches the yellow bar, so the browser's toolbar joins in
  color: '#febc20',
};

// how many of the newest posts go on the front page
export const latest = 50;

export const nav = [
  { label: 'Archive', href: '/archive/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'Projects', href: 'https://peng.ly/projects' },
  { label: 'Contact', href: 'https://peng.ly/contact' },
];
