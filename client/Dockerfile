FROM alpine:3.20.3 AS build

RUN --mount=type=cache,target=/var/cache/apk \
    apk add nodejs npm

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm/_cacache \
    npm ci --legacy-peer-deps

COPY . .

ENV NEXT_PUBLIC_SERVER_URL="/"
ENV NEXT_PUBLIC_SAME_ORIGIN="yes"
RUN --mount=type=cache,target=/app/.next \
    npm run build


FROM nginx:1.27.3-alpine3.20-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/out/ /usr/share/nginx/html

EXPOSE 80