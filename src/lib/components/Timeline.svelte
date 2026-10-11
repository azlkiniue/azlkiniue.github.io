<script lang="ts">
	import { byYear, type Project } from '#lib/projects.ts';

	let {
		projects,
		root,
		onselect
	}: {
		projects: Project[];
		root: string;
		/** Called before the browser follows a link to a project's card. */
		onselect?: (name: string) => void;
	} = $props();
</script>

<ul class="tree">
	<li>
		<p class="m-0"><strong>{root}</strong></p>
		<ul>
			{#each byYear(projects) as [year, list] (year)}
				<li>
					{year}
					<ul>
						{#each list as project (project.name)}
							<li>
								<time class="text-fg-alt" datetime={project.createdAt}>{project.createdAt.slice(5, 10)}</time>
								<a href="#{project.name}" onclick={() => onselect?.(project.name)}>{project.name}</a>
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</li>
</ul>
