---
title: The one inline script, and the hash that lets it run
description: Dark mode without a flash needs a script that runs before the page paints, and a strict CSP wants to know exactly which one. Here's how they get along.
date: 2026-10-09
tags: [security, astro]
---

The theme toggle has a classic problem. Your pick lives in `localStorage`, and nothing can read it before the page paints unless a script runs first. Load that script the normal way and you get a flash of the wrong theme on every single page. Not exactly ideal.

## The script

It goes inline in the `<head>`, before any CSS, so it runs before anything gets drawn:

```js title="src/lib/theme.ts"
try {
  const theme = localStorage.getItem('theme');
  if (theme) document.documentElement.dataset.theme = theme;
} catch {}
```

The real one's squashed onto a single line, but it's the same thing. The `try` is there because browsers throw if you touch storage while cookies are blocked, and a theme isn't worth breaking the page over.

## The policy

This site sends a Content Security Policy that only lets scripts from its own origin run. An inline script breaks that rule, so the policy names this one by its SHA-256 hash:

```diff
- script-src 'self' 'unsafe-inline'
+ script-src 'self' 'sha256-1Ub7...'
```

`'unsafe-inline'` would've worked too, but then any script that got injected into a page would run as well, which is the exact thing CSP is there to stop.

### Keeping the two in step

Change one character of the script and the hash stops matching. The browser blocks it, the console grumbles, and the theme starts flashing again. Nothing on the page tells you. So there's a test that hashes the script and checks `vercel.json` still has it:

```ts title="src/lib/theme.test.ts" {4}
test("vercel.json's CSP trusts the theme script as it is now", async () => {
  const { headers } = JSON.parse(await readFile('vercel.json', 'utf8'));
  // ...find the Content-Security-Policy header...
  const hash = `'sha256-${createHash('sha256').update(themeScript).digest('base64')}'`;
  assert.ok(csp.includes(hash), `script-src wants ${hash}`);
});
```

If it fails, the message has the new hash in it, ready to paste.

## Everything else

Every other script here ships as its own file, so `'self'` covers it. The JSON-LD blocks look like scripts but browsers never run them, so CSP leaves them alone. Styles get `'unsafe-inline'`, because the syntax highlighting puts its colours in `style` attributes, and an injected style is a much smaller worry than an injected script.

You can see the whole policy in the response headers of this page, if you fancy a look.
