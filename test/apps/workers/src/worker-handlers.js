export function scheduled(controller, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${controller.cron}:${String(!!env)}`));
}

export function queue(batch, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${batch.messages.length}:${String(!!env)}`));
}

export function email(message, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${message.from}:${String(!!env)}`));
}
