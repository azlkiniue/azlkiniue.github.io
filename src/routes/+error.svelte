<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} · Ahmada Yusril</title>
</svelte:head>

<table class="header">
	<tbody>
		<tr>
			<td class="width-auto text-left">
				<h1 class="title">{page.status}</h1>
				<span class="subtitle">{page.error?.message ?? 'Something went wrong'}</span>
			</td>
		</tr>
	</tbody>
</table>

<p>
	{#if page.status === 404}
		There's nothing at <code class="break-all">{page.url.pathname}</code>. It may have moved, or never
		existed.
	{:else}
		Something broke while loading this page.
	{/if}
</p>

<p><a href="/">← Back to the projects</a></p>
