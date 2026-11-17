import { handleCatchup } from "./utils/fetching.ts";
import { config } from "./utils/config.ts";
import { createUpdateWebhookEndpoint } from "./endpoints/updateWebhook.ts";
import { createSkipSegmentsEndpoint } from "./endpoints/skipSegments.ts";
import Fastify, { type FastifyInstance } from "fastify";

const server: FastifyInstance = Fastify();

handleCatchup();

createSkipSegmentsEndpoint(server);
createUpdateWebhookEndpoint(server);

try {
    await server.listen({ port: config.port ?? 3000, host: config.host ?? "0.0.0.0" })
    console.log(`Server listening on ${config.host ?? "0.0.0.0"}:${config.port ?? 3000}`);

} catch (err) {
    console.error(err);
    process.exit(1);
}
