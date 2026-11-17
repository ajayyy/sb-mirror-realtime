FROM node:26-alpine AS builder
COPY package.json package-lock.json tsconfig.json ./
COPY src src
RUN npm ci && npx tsc -p tsconfig.json

FROM node:26-alpine AS app
WORKDIR /usr/src/app
COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./dist ./dist
COPY ./.git/ ./.git
COPY sql/*.sql sql/
EXPOSE 8080

CMD ["node", "dist/index.js"]