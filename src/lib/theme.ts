export const themeKey = 'theme';

// runs before the first paint so a picked theme never flashes the other one, and vercel.json
// trusts it by hash, so any edit here needs the new hash over there (the test says which)
export const themeScript = `try{const t=localStorage.getItem('${themeKey}');if(t)document.documentElement.dataset.theme=t}catch{}`;
