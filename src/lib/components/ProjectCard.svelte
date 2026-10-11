<script lang="ts">
	import { isoDate, type Project } from '#lib/projects.ts';

	let { project, number }: { project: Project; number: number } = $props();

	const meta = $derived([project.language, project.license].filter(Boolean).join(' · '));
</script>

<!-- Flex/grid items don't collapse margins, so every child sets its own instead of relying on `* + *`. -->
<article id={project.name} class="box flex h-full scroll-mt-line flex-col target:bg-bg-alt">
	<h3 class="m-0">
		<span class="text-fg-alt">{String(number).padStart(2, '0')}</span>
		<span class="emoji-cell" aria-hidden="true">{project.emoji}</span>
		{project.name}
	</h3>
	<p class="m-0">{project.description}</p>
	<p class="m-0 mt-auto pt-line text-fg-alt">
		{#if meta}{meta}<br />{/if}
		Updated <time datetime={project.pushedAt}>{isoDate(project.pushedAt)}</time>
	</p>
	<p class="m-0">
		{#if project.url}<a href={project.url}>Live site ↗</a>{' · '}{/if}<a href={project.repo}>Source ↗</a>
	</p>
</article>
