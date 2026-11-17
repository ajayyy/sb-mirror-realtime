import { config } from "./config.ts";
import sql from "./database.ts";
import crypto from "crypto";

export async function handleCatchup() {
    await subscribeToWebhook();

    const latestUpdate = await sql`SELECT last_updated FROM segment_buckets ORDER BY last_updated DESC LIMIT 1`;

    if (latestUpdate.length > 0) {
        const updateRequest = await fetch(`${config.mainBackend}/api/skipSegmentsUpdates?time=${latestUpdate[0].last_updated}&prefixSize=${
            config.prefixSize}&categories=${JSON.stringify(config.categories)}&actionTypes=${JSON.stringify(config.actionTypes)}`);

        if (updateRequest.ok) {
            const updatesNeeded = await updateRequest.json();
            for (const update of updatesNeeded) {
                await updateBucket(update.hashPrefix);
            }
        } else {
            console.error(`Failed to fetch catch up updates since ${latestUpdate[0].last_updated}`)
        }
    } else {
        //todo: handle full catch up
    }
}

async function subscribeToWebhook() {
    const webhookAuth = await sql`SELECT auth FROM update_webhooks LIMIT 1`;
    let auth = webhookAuth?.[0]?.auth;

    if (!auth) {
        auth = generateRandomPassword(50);
        await sql`INSERT INTO update_webhooks VALUES (${auth})`;
    }

    await fetch(`${config.mainBackend}/api/skipSegmentsSubscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subscribeAuth: config.subscribeAuth,
                categories: config.categories,
                actionTypes: config.actionTypes,
                prefixSize: config.prefixSize,
                url: `${config.baseUrl}/api/update/${auth}`
            })
        });
}

export async function updateBucket(hashPrefix: string) {
    if (hashPrefix.length !== config.prefixSize) {
        console.error(`Update called for hash prefix that is not size ${config.prefixSize}: ${hashPrefix}`);
        return;
    }

    const request = await fetch(`${config.mainBackend}/api/skipSegments/${hashPrefix}?categories=${JSON.stringify(config.categories)}&actionTypes=${JSON.stringify(config.actionTypes)}`);

    if (request.ok || request.status === 404) {
        const result = await request.text();

        await sql`INSERT INTO segment_buckets (hash_prefix, response, last_updated) VALUES (${hashPrefix}, ${result}, NOW())
            ON CONFLICT (hash_prefix)
            DO UPDATE SET response = EXCLUDED.response, last_updated = EXCLUDED.last_updated`;
        return result;
    } else {
        console.error(`Failed to update bucket ${hashPrefix}`);
    }
}

function generateRandomPassword(length: number): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}