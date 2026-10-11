# azlkiniue.github.io

Source for [azlkiniue.github.io](https://azlkiniue.github.io): a showcase of the
projects featured on my [GitHub profile](https://github.com/azlkiniue), styled
after [The Monospace Web](https://github.com/owickstrom/the-monospace-web).

Built with SvelteKit (prerendered to static HTML via `adapter-static`) and
Tailwind CSS, using [Bun](https://bun.com) as the package manager and runtime;
Node.js is not needed. `bunfig.toml` makes `bun run` execute Vite and SvelteKit on
Bun even though their CLIs declare a `node` shebang.

## Develop

```sh
bun install
bun run dev        # http://localhost:5173
bun run check      # type-check
bun run build      # static site in ./build
bun run preview    # serve ./build
```

## Updating the project list

The list is **not** hard-coded. `bun run sync:projects` reads the "Featured
Repositories" section of the [profile README](https://github.com/azlkiniue/azlkiniue)
(order, emoji, blurb, links), adds metadata from the GitHub API (language,
license, created/pushed dates), and writes `src/lib/data/projects.json` — only
when something changed. Builds only read the JSON, so they're reproducible and
need no network access or token.

`.github/workflows/sync-projects.yml` runs the sync every 3 days; if the data
changed, it commits the JSON and starts the GitHub Pages deploy. Run it right
away from the **Actions** tab ("Sync projects" → **Run workflow**), or locally:

```sh
GITHUB_TOKEN=$(gh auth token) bun run sync:projects   # token is optional
```

## Layout

| Path                         | What                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| `src/routes/+page.svelte`    | The page: header, projects, timeline, slides, colophon        |
| `src/routes/+error.svelte`   | 404 page (emitted as `build/404.html`)                       |
| `src/lib/components/`        | Project card, language filter (ASCII bar chart), timeline    |
| `src/lib/styles/`            | Vendored Monospace Web CSS (MIT), used as Tailwind's base layer |
| `src/routes/layout.css`      | Tailwind entry: theme tokens and grid-aware utilities        |
| `scripts/sync-projects.ts`   | Regenerates `src/lib/data/projects.json`                     |
| `static/slides/itcamp/`      | reveal.js slides, served as-is at `/slides/itcamp/`    |

Tick **Debug mode** on the page to overlay the character grid and outline any
element that falls off it.

## Deploy

### GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `master`.
In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.

### Cloudflare Pages

Connect the repository and use:

| Setting                | Value                                            |
| ---------------------- | ------------------------------------------------ |
| Build command          | `bun install --frozen-lockfile && bun run build` |
| Build output directory | `build`                                          |
| Environment variables  | `BUN_VERSION=1.3.14`, `SKIP_DEPENDENCY_INSTALL=1` |

`SKIP_DEPENDENCY_INSTALL` stops Pages from running its own (npm) install, so
dependencies are installed by Bun from `bun.lock`.

## License

The vendored Monospace Web styles are © Oskar Wickström, MIT licensed; see
`src/lib/styles/MONOSPACE-WEB-LICENSE.md`.
