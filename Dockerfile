FROM node:22-bookworm-slim

WORKDIR /app

COPY . .

RUN corepack enable && \
    mkdir -p /app/data && \
    yarn install --non-interactive

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/data/users.sqlite \
    CLIENT_DIST_DIR=/app/client/dist

EXPOSE 3000

CMD ["sh", "-c", "yarn build && yarn seed && yarn start"]
