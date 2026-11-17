# Real-time SponsorBlock segments mirror

Experimental mirror for only the hash-prefix based `/api/skipSegments` endpoint in SponsorBlock.

## How it works

With the hash-prefix based fetching system, the data can be split into a limited set of buckets. This service caches the data for each bucket, and subscribes to a webhook from the main SponsorBlock server to be notified when a bucket needs to be updated.

Still to do:

1. Building up the initial cache
1. Catch up on updates in case of mirror downtime

## How to use

1. Rename `config.json.example` to `config.json` and fill out the properties as described in the comments
1. Rename `docker/database.env.example` to `docker/database.env` and ensure the password is the same as in `config.json`
1. Start the service using Docker Compose:

```bash
cd docker
docker-compose up -d
```