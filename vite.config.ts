import { existsSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

/**
 * GitHub Pages, Cloudflare Pages and `vite preview` serve `static/<dir>/index.html` for
 * `/<dir>/`, but `vite dev` doesn't, so pages like the reveal.js slides at /slides/itcamp/
 * would 404 in development. Map directory URLs to their index.html, redirecting to add the
 * trailing slash first (as the hosts do) so the page's relative asset URLs resolve.
 */
function staticDirectoryIndex(dir = 'static'): Plugin {
	return {
		name: 'static-directory-index',
		apply: 'serve',
		configureServer(server) {
			const root = resolve(server.config.root, dir);
			server.middlewares.use((req, res, next) => {
				const url = new URL(req.url ?? '/', 'http://localhost');
				let pathname: string;
				try {
					pathname = decodeURIComponent(url.pathname);
				} catch {
					return next();
				}
				const index = join(root, pathname, 'index.html');
				if (!index.startsWith(root + sep) || !existsSync(index)) return next();

				if (!url.pathname.endsWith('/')) {
					res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
					return res.end();
				}
				req.url = `${url.pathname}index.html${url.search}`;
				next();
			});
		}
	};
}

export default defineConfig({
	plugins: [
		staticDirectoryIndex(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Static HTML for GitHub Pages / Cloudflare Pages. Both serve 404.html for
			// unknown paths, which renders src/routes/+error.svelte.
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
