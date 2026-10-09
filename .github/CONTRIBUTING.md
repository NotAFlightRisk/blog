# Contributing

Thanks for taking the time 🎉<br />
Bug reports, typo fixes and whole features are all welcome. By joining in, you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Ways to contribute

- 🐛 **Report a bug** - open a [bug report](https://github.com/NotAFlightRisk/blog/issues/new?template=bug_report.yml)
- 💡 **Suggest a feature** - open a [feature request](https://github.com/NotAFlightRisk/blog/issues/new?template=feature_request.yml)
- 📖 **Fix a post** - typos, broken links and things I got wrong are all fair game
- 🔧 **Submit a fix** - see below
- 🔒 **Report a vulnerability** - please *don't* open a public issue, see [SECURITY.md](./SECURITY.md)

---

## Getting started

```bash
git clone git@github.com:NotAFlightRisk/blog.git
cd blog
npm install
npm run dev
```

There's a bit more detail in the [Development](./README.md#development) section of the README.

---

## Pull requests

1. **Open an issue first** for anything non-trivial. Saves you writing code we might not merge.
2. **Fork it**, and branch off `main`. Name it something descriptive, like `fix/timeout-handling`.
3. **Keep it focused.** One logical change per PR, please.
4. **Add tests** for any new logic. A new post doesn't need any, the build checks it.
5. **Run `npm run check`, `npm run format:check` and `npm test`** before you push.
6. **Open the PR**, fill in the template, and link the issue it closes.

Dont worry about getting it perfect first time, we're happy to help get it over the line.

---

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/), and the release notes are generated from them, so it does matter:

```
feat: add support for custom timeouts
fix: handle empty response from upstream
docs: clarify the deployment steps
```

Types are `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci` and `chore`. Breaking changes get a `!` (like `feat!:`) plus a `BREAKING CHANGE:` footer.

---

### What we look for

- The change does one thing, and does it clearly
- Tests pass, and new behaviour has new tests
- Docs updated if public behaviour changed
- No unrelated reformatting mixed into the diff

---

## Licensing

By contributing, you agree that your work is licensed under the [MIT License](../LICENSE) that covers this project.
