# Imagen de producción de Abordo (Next.js en modo standalone).
# NODE_IMAGE permite usar un espejo si Docker Hub limita las descargas.
ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE} AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY scripts/copy-assets.mjs scripts/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/public ./public
COPY . .
# Valores públicos: quedan dentro del código del navegador al compilar.
ARG NEXT_PUBLIC_PMTILES_URL=/tiles/colombia.pmtiles
ARG NEXT_PUBLIC_MAP_ASSETS_URL=/tiles/assets
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=
ARG NEXT_PUBLIC_GEOCODER_URL=https://nominatim.openstreetmap.org
ENV NEXT_PUBLIC_PMTILES_URL=$NEXT_PUBLIC_PMTILES_URL \
    NEXT_PUBLIC_MAP_ASSETS_URL=$NEXT_PUBLIC_MAP_ASSETS_URL \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY \
    NEXT_PUBLIC_GEOCODER_URL=$NEXT_PUBLIC_GEOCODER_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM ${NODE_IMAGE} AS run
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S abordo && adduser -S abordo -G abordo
COPY --from=build --chown=abordo:abordo /app/.next/standalone ./
COPY --from=build --chown=abordo:abordo /app/.next/static ./.next/static
COPY --from=build --chown=abordo:abordo /app/public ./public
COPY --from=build --chown=abordo:abordo /app/db/migrations ./db/migrations
USER abordo
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=4s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
