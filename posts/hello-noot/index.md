---
title: Noot noot, it's a blog
description: The first post, and a quick look round. Every post is a folder of Markdown, comes with a feed and a plain text copy, and there's a penguin.
date: 2026-10-07
updated: 2026-10-09
tags: [meta, astro]
---

This is the writing bit of [peng.ly](https://peng.ly). Mostly code, security and whatever I've been poking at that week, written up so I remember it, and so you don't have to find out the hard way.

## What's here

Each post lives in its own folder as plain Markdown, with any pictures sat right next to it. That's the whole system.

- Every post is tagged, and every tag gets [its own page](/tags/)
- The [archive](/archive/) has the lot, by year
- [Search](/search/) runs in your browser, so nothing you type gets sent anywhere

> Spotted something wrong? The source for every post is [on GitHub](https://github.com/NotAFlightRisk/blog), so a PR is very welcome.

## For the robots

Plenty of what reads this stuff isn't a person, so everything has a version a machine can pick up easily.

| What | Where |
| --- | --- |
| Full-text RSS | [`/rss.xml`](/rss.xml) |
| A contents page for LLMs | [`/llms.txt`](/llms.txt) |
| Every post in one file | [`/llms-full.txt`](/llms-full.txt) |
| Any post as Markdown | its address, with `.md` on the end |
| Sitemap | [`/sitemap-index.xml`](/sitemap-index.xml) |

### Light, dark, or whatever your system says

The theme follows your system until you press the toggle up top, then it remembers your pick. Choose the one your system would've shown anyway and it goes back to following along.

![The front page of the blog, in the light theme on the left and the dark one on the right](./light-and-dark.png)

## Under the bonnet

It's [Astro](https://astro.build), built to static files and served from Vercel. No JavaScript turns up unless a page needs it, and so far that's search, the copy buttons on code and the theme toggle.

```ts title="astro.config.ts" {2-3}
export default defineConfig({
  site: 'https://blog.peng.ly',
  trailingSlash: 'always',
  markdown,
});
```

Thanks for reading :)
