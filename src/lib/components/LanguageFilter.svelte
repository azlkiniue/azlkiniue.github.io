<script lang="ts">
	let {
		options,
		value = $bindable()
	}: { options: [language: string, count: number][]; value: string } = $props();

	// An ASCII bar chart where each row is also a radio button.
	const max = $derived(Math.max(...options.map(([, count]) => count)));
	const labelWidth = $derived(Math.max(...options.map(([language]) => language.length)) + 2);
	const bar = (count: number) => '█'.repeat(count * 2) + '░'.repeat((max - count) * 2);
</script>

<fieldset class="overflow-x-auto">
	<legend class="sr-only">Filter projects by language</legend>
	{#each options as [language, count] (language)}
		<label class="cursor-pointer whitespace-pre hover:bg-bg-alt has-checked:font-bold">
			<input type="radio" name="language" value={language} bind:group={value} />{' ' +
				language.padEnd(labelWidth)}<span aria-hidden="true">{bar(count)}</span>{' ' +
				String(count).padStart(2)}<span class="sr-only"> projects</span>
		</label>
	{/each}
</fieldset>
