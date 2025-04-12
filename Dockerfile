FROM node:22-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN yarn install
RUN yarn build

FROM base AS runner
USER node

COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]