import { env } from 'cloudflare:workers';

export async function GET({ url }) {
	const stub = env.EXAMPLE_DO.get(env.EXAMPLE_DO.idFromName('test'));
	if (url.searchParams.has('scheduled')) {
		return new Response(String(await stub.last_scheduled()));
	}
	return new Response(await stub.greet('SvelteKit'));
}
