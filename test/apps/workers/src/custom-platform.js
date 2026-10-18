import { DurableObject } from 'cloudflare:workers';

export class ExampleDurableObject extends DurableObject {
	/** @param {string} name */
	greet(name) {
		return `Hello, ${name} from a Durable Object`;
	}

	/** @param {string} cron */
	async record_scheduled(cron) {
		await this.ctx.storage.put('scheduled', cron);
	}

	async last_scheduled() {
		return (await this.ctx.storage.get('scheduled')) ?? null;
	}
}

export async function scheduled(controller, env) {
	await env.EXAMPLE_DO.get(env.EXAMPLE_DO.idFromName('test')).record_scheduled(controller.cron);
}

export function queue(batch, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${batch.messages.length}:${String(!!env)}`));
}

export function email(message, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${message.from}:${String(!!env)}`));
}

export function tail(events, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${events.length}:${String(!!env)}`));
}
