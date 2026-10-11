import snapshot from './data/projects.json';

export interface Project {
	name: string;
	emoji: string;
	description: string;
	/** Live site (usually GitHub Pages). */
	url: string | null;
	repo: string;
	language: string | null;
	/** SPDX identifier, e.g. "MIT". */
	license: string | null;
	createdAt: string;
	pushedAt: string;
}

export interface ProjectsSnapshot {
	source: string;
	syncedAt: string;
	projects: Project[];
}

export const { source, syncedAt, projects } = snapshot as ProjectsSnapshot;

/** "2026-10-06T04:49:55Z" → "2026-10-06" */
export const isoDate = (timestamp: string) => timestamp.slice(0, 10);

/** Projects grouped by the year they were started, newest year first. */
export function byYear(list: Project[]): [year: string, projects: Project[]][] {
	const groups = new Map<string, Project[]>();
	for (const project of [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
		const year = project.createdAt.slice(0, 4);
		groups.set(year, [...(groups.get(year) ?? []), project]);
	}
	return [...groups];
}

/** [language, number of projects] pairs, most used first. */
export function languageCounts(list: Project[]): [language: string, count: number][] {
	const counts = new Map<string, number>();
	for (const { language } of list) {
		if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
	}
	return [...counts].sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
}
