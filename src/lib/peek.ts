// the bar's the same on every page, so he only peeks up on the first one a visit lands on, and
// this runs before the bar's drawn so he never starts to. vercel.json trusts it by hash, so any
// edit needs the new hash there (the test says which)
export const peekScript = `if(document.referrer.startsWith(location.origin+'/'))document.documentElement.dataset.peeked=''`;
