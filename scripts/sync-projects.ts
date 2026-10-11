/// <reference types="bun" />
/**
 * Regenerates src/lib/data/projects.json from the "Featured Repositories" list
 * in the github.com/azlkiniue/azlkiniue profile README, enriched with metadata
 * from the GitHub API. The README stays the single source of truth for which
 * repositories are showcased, in what order, and with which emoji/blurb.
 *
 *   bun run sync:projects
 *   GITHUB_TOKEN=... bun run sync:projects   # higher API rate limit
 */
import type { Project, ProjectsSnapshot } from '../src/lib/projects.ts';

const OWNER = 'azlkiniue';
const OUT = new URL('../src/lib/data/projects.json', import.meta.url);

const token = Bun.env.GITHUB_TOKEN ?? Bun.env.GH_TOKEN;
const headers: Record<string, string> = {
	Accept: 'application/vnd.github+json',
	'User-Agent': `${OWNER}.github.io`,
	'X-GitHub-Api-Version': '2022-11-28',
	...(token ? { Authorization: `Bearer ${token}` } : {})
};

async function github(path: string, accept?: string): Promise<Response> {
	const res = await fetch(`https://api.github.com${path}`, {
		headers: accept ? { ...headers, Accept: accept } : headers
	});
	if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
	return res;
}

interface ReadmeEntry {
	emoji: string;
	name: string;
	description: string;
	url: string | null;
	repo: string;
}

// Matches entries shaped like:
//   - 🌌 **astronomy-education** — Bilingual interactive astronomy simulations.
//     [GitHub Page](https://…) • [Repository](https://github.com/azlkiniue/astronomy-education)
const ENTRY = /^- (\S+)\s+\*\*(.+?)\*\*\s+[—–-]\s+(.+?)\s*\n\s+(.+)$/gm;
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function parseReadme(markdown: string): ReadmeEntry[] {
	return [...markdown.matchAll(ENTRY)].map(([, emoji, name, description, linkLine]) => {
		const links = [...linkLine.matchAll(LINK)].map(([, label, href]) => ({ label, href }));
		const repo = links.find((l) => /github\.com\/[^/]+\/[^/]+/.test(l.href) && /repo/i.test(l.label));
		const page = links.find((l) => l !== repo);
		if (!repo) throw new Error(`No repository link for "${name}"`);
		return { emoji, name, description, url: page?.href ?? null, repo: repo.href };
	});
}

const readme = await (await github(`/repos/${OWNER}/${OWNER}/readme`, 'application/vnd.github.raw')).text();
const entries = parseReadme(readme);
if (entries.length === 0) throw new Error('No featured repositories found in the profile README');

const projects: Project[] = await Promise.all(
	entries.map(async (entry) => {
		const fullName = new URL(entry.repo).pathname.replace(/^\/|\/$/g, '');
		const meta = await (await github(`/repos/${fullName}`)).json();
		return {
			...entry,
			url: entry.url ?? (meta.homepage || null),
			language: meta.language ?? null,
			license: meta.license?.spdx_id && meta.license.spdx_id !== 'NOASSERTION' ? meta.license.spdx_id : null,
			createdAt: meta.created_at,
			pushedAt: meta.pushed_at
		};
	})
);

const source = `https://github.com/${OWNER}/${OWNER}`;

// Leave the file (and its syncedAt) alone when nothing changed, so the scheduled
// sync workflow only commits and redeploys when there's something new to show.
const previous: ProjectsSnapshot | null = await Bun.file(OUT)
	.json()
	.catch(() => null);
if (
	previous?.source === source &&
	JSON.stringify(previous.projects) === JSON.stringify(projects)
) {
	console.log(`${projects.length} projects, no changes since ${previous.syncedAt}`);
	process.exit(0);
}

const snapshot: ProjectsSnapshot = { source, syncedAt: new Date().toISOString(), projects };

await Bun.write(OUT, JSON.stringify(snapshot, null, '\t') + '\n');
console.log(`Wrote ${projects.length} projects to ${Bun.fileURLToPath(OUT)}`);
