import { type FastifyInstance, type RouteShorthandOptions, type FastifyReply, type FastifyRequest } from "fastify";
import sql from "../utils/database.ts";
import { updateBucket } from "../utils/fetching.ts";

interface UpdateWebhookQuery {
    auth: string
}

interface UpdateWebhookBody {
    hashPrefix: string
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
        type: "object",
        properties: {
            hashPrefix: {
                type: "string"
            },
            auth: {
                type: "string"
            }
        }
    }
  }
}

async function updateWebhook(request: FastifyRequest<{Params: UpdateWebhookQuery, Body: UpdateWebhookBody}>, reply: FastifyReply) {
    const { auth } = request.params;
    const { hashPrefix } = request.body;

    const authValid = await sql`SELECT 1 FROM update_webhooks WHERE auth = ${auth} LIMIT 1`;
    if (authValid.length > 0) {
        await updateBucket(hashPrefix);
        return reply.send("Success");
    } else {
        return reply.status(401).send({ error: "Unauthorized" });
    }
}

export function createUpdateWebhookEndpoint(server: FastifyInstance) {
    server.post<{Params: UpdateWebhookQuery, Body: UpdateWebhookBody}>('/api/update/:auth', opts, updateWebhook);
}