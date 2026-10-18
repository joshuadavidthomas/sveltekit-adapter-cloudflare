import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '../../../index.js';

/** @type {import('vite').UserConfig} */
const config = {
	build: {
		minify: false
	},
	plugins: [
		sveltekit({
			adapter: adapter({
				config: 'config/wrangler.jsonc',
				platform: 'src/custom-platform.js'
			})
		})
	]
};

export default config;
