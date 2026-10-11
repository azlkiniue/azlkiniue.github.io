<script lang="ts">
	import { flushSync, tick } from 'svelte';
	import LanguageFilter from '#lib/components/LanguageFilter.svelte';
	import ProjectCard from '#lib/components/ProjectCard.svelte';
	import Timeline from '#lib/components/Timeline.svelte';
	import { checkOffsets } from '#lib/grid.ts';
	import { isoDate, languageCounts, projects, source, syncedAt } from '#lib/projects.ts';

	const NAME = 'Ahmada Yusril';
	const HANDLE = 'azlkiniue';
	const DESCRIPTION =
		'Simple websites designed to be interesting, educational, or simply cool to mess around with.';

	const ALL = 'All';
	const languages: [string, number][] = [[ALL, projects.length], ...languageCounts(projects)];

	let language = $state(ALL);
	const shown = $derived(language === ALL ? projects : projects.filter((p) => p.language === language));

	// Bring back a card that's filtered out before the browser scrolls to it.
	function reveal(name: string) {
		if (!shown.some((p) => p.name === name)) {
			language = ALL;
			flushSync();
		}
	}

	let debug = $state(false);
	$effect(() => {
		document.body.classList.toggle('debug', debug);
		if (!debug) return;
		void shown; // re-check when the project list changes
		const check = () => tick().then(checkOffsets);
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	});
</script>

<svelte:head>
	<title>{NAME} · Projects</title>
	<meta name="description" content={DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="{NAME} · Projects" />
	<meta property="og:description" content={DESCRIPTION} />
</svelte:head>

<table class="header">
	<tbody>
		<tr>
			<td colspan="2" rowspan="2" class="width-auto">
				<h1 class="title">{NAME}</h1>
				<span class="subtitle">A showcase of small web projects</span>
			</td>
			<th class="width-min">Projects</th>
			<td class="width-min">{projects.length}</td>
		</tr>
		<tr>
			<th class="width-min">Updated</th>
			<td class="width-min"><time class="whitespace-pre" datetime={syncedAt}>{isoDate(syncedAt)}</time></td>
		</tr>
		<tr>
			<th class="width-min">GitHub</th>
			<td colspan="3" class="text-left"><a href="https://github.com/{HANDLE}">github.com/{HANDLE}</a></td>
		</tr>
	</tbody>
</table>

<label class="debug-toggle-label">
	<input type="checkbox" class="debug-toggle" bind:checked={debug} /> Show grid
</label>

<p>
	Hi there <span class="emoji-cell" aria-hidden="true">👋</span> I create simple websites designed to
	be interesting, educational, or simply cool to mess around with. Click around, check some of them out,
	and have fun exploring!
</p>

<nav id="toc" aria-labelledby="toc-title">
	<h2 id="toc-title">Contents</h2>
	<ul>
		<li><a href="#projects">Projects</a></li>
		<li><a href="#timeline">Timeline</a></li>
		<li><a href="#slides">Slides</a></li>
		<li><a href="#colophon">Colophon</a></li>
	</ul>
</nav>

<h2 id="projects">Projects</h2>
<p>
	The repositories featured on my <a href={source}>GitHub profile</a>, each with a live site you can
	play with. Pick a language to narrow the list down:
</p>

<LanguageFilter options={languages} bind:value={language} />

<p class="sr-only" aria-live="polite">Showing {shown.length} of {projects.length} projects</p>
<ul class="mt-line grid list-none gap-x-[2ch] gap-y-line p-0 sm:grid-cols-2-ch">
	{#each shown as project (project.name)}
		<li><ProjectCard {project} number={projects.indexOf(project) + 1} /></li>
	{/each}
</ul>

<h2 id="timeline">Timeline</h2>
<p>When each project got started, newest first.</p>

<Timeline {projects} root="~/{HANDLE}" onselect={reveal} />

<h2 id="slides">Slides</h2>
<table>
	<thead>
		<tr>
			<th class="width-min">Year</th>
			<th class="width-auto">Title</th>
			<th class="width-min">Link</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>2021</td>
			<td>
				Computer Security Incident Handling Guide<br />
				<span class="text-fg-alt">ITCamp Virtual 2021</span>
			</td>
			<!-- Plain static files: rel=external skips the client-side router and the prerender crawler. -->
			<td><a href="/slides/itcamp/" rel="external">View</a></td>
		</tr>
	</tbody>
</table>

<hr />

<h2 id="colophon">Colophon</h2>
<p>
	Built with <a href="https://svelte.dev/docs/kit">SvelteKit</a> and
	<a href="https://tailwindcss.com">Tailwind CSS</a> on <a href="https://bun.com">Bun</a>, and prerendered to
	static HTML. Set in <a href="https://www.jetbrains.com/lp/mono/">JetBrains Mono</a> on a character grid,
	after <a href="https://owickstrom.github.io/the-monospace-web/">The Monospace Web</a> by Oskar Wickström.
	The project list is synced from my <a href={source}>profile README</a>.
	<a href="https://github.com/{HANDLE}/{HANDLE}.github.io">Source code</a>.
</p>

<div class="debug-grid"></div>
