import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['icons/alfred-state-logo-A.svg', 'icons/icon-192x192.png', 'icons/icon-512x512.png'],
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
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
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
				runtimeCaching: [
					{
						urlPattern: /^\/.*$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages-cache',
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
						}
					},
					{
						urlPattern: /\.(?:js|css)$/,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'assets-cache',
							expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images-cache',
							expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					}
				]
			}
		})
	]
});
