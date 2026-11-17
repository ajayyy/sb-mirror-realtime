import { type FastifyRequest, type RouteShorthandOptions, type FastifyInstance, type FastifyReply } from "fastify";
import sql from "../utils/database.ts";
import { config } from "../utils/config.ts";
import { updateBucket } from "../utils/fetching.ts";

interface SkipSegmentsQuery {
    hashPrefix: string
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
        type: "object",
        properties: {
            hashPrefix: {
                type: "string"
            }
        }
    }
  }
}

async function skipSegments(request: FastifyRequest<{Params: SkipSegmentsQuery}>, reply: FastifyReply) {
    const { hashPrefix } = request.params;

    if (hashPrefix.length !== config.prefixSize) return reply.code(400).send(`Hash prefix must be size ${config.prefixSize}`);

    const result = await sql`SELECT response FROM segment_buckets WHERE hash_prefix = ${hashPrefix} LIMIT 1`;

    if (result.length > 0) {
        return reply.header("Content-Type", "application/json").send(result[0].response);
    } else {
        return reply.header("Content-Type", "application/json").send(await updateBucket(hashPrefix));
    }
}

export function createSkipSegmentsEndpoint(server: FastifyInstance) {
    server.get<{Params: SkipSegmentsQuery}>('/api/skipSegments/:hashPrefix', opts, skipSegments);
}