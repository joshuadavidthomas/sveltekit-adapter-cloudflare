export function scheduled(controller, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${controller.cron}:${String(!!env)}`));
}
