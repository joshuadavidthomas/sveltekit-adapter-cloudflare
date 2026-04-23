import adapter from '../../../index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			config: 'config/wrangler.jsonc',
			platform: 'src/custom-platform.js'
		})
	}
};

export default config;
