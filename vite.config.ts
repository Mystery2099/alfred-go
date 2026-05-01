import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['icons/alfred-state-logo-A.svg'],
			manifest: {
				name: 'AlfredGO',
				short_name: 'AlfredGO',
				description: 'Fast access to Alfred State campus resources.',
				theme_color: '#003C71',
				background_color: '#F3F7FB',
				display: 'standalone',
				start_url: '/',
				icons: [
					{
						src: '/icons/alfred-state-logo-A.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				navigateFallback: '/offline',
				runtimeCaching: []
			}
		})
	]
});
