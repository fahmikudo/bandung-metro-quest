# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM deps AS builder
WORKDIR /app
COPY . .

# VITE_* ditanam ke bundle saat build time, bukan dibaca saat runtime:
# mengubah GA4 ID atau nomor WA membutuhkan image/rilis baru.
ARG VITE_GA_MEASUREMENT_ID=""
ARG VITE_WHATSAPP_NUMBER="6285155377009"
ARG VITE_BMKG_API_BASE="/api/bmkg"

ENV VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID}
ENV VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER}
ENV VITE_BMKG_API_BASE=${VITE_BMKG_API_BASE}

RUN npm run build


FROM nginx:1.27-alpine AS runner

# Server block internal container: SPA fallback, cache policy, gzip, & proxy BMKG.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
