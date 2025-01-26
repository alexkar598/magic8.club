FROM alpine:3.20.3

RUN --mount=type=cache,target=/var/cache/apk \
    apk add nodejs npm

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm/_cacache \
    npm ci --legacy-peer-deps

COPY . .

ENV SAME_ORIGIN="yes"
ENV NODE_ENV="production"
CMD ["npm", "start"]