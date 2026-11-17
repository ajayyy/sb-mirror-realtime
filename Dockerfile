FROM node:27-alpine AS builder
COPY package.json package-lock.json tsconfig.json ./
COPY src src
RUN npm ci && npm run tsc

FROM node:27-alpine AS app
WORKDIR /usr/src/app
RUN apk add --no-cache git postgresql-client
COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./dist ./dist
COPY ./.git/ ./.git
COPY databases/*.sql databases/
EXPOSE 8080