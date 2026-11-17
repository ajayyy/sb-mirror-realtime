CREATE TABLE IF NOT EXISTS segment_buckets (
    hash_prefix TEXT,
    response TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (hash_prefix)
);

CREATE TABLE IF NOT EXISTS update_webhooks (
    auth TEXT,
    PRIMARY KEY (auth)
);
