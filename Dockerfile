# syntax = docker/dockerfile:1

# Use Node.js 22 LTS (latest stable)
ARG NODE_VERSION=22-slim
FROM node:${NODE_VERSION} as base

ARG DATABASE_URL
ARG ELASTICSEARCH_URL
ARG ELASTIC_PASSWORD
ARG OPENAI_API_KEY

LABEL fly_launch_runtime="Next.js/Prisma"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install both OpenSSL 1.1.x and 3.0.x
RUN apt-get update && \
    apt-get install -y libssl-dev openssl

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY --link . .

COPY --link db-postgres/prisma ./prisma
RUN DATABASE_URL=$DATABASE_URL npx prisma generate

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

RUN apt-get update -qq && \
    apt-get install -y openssl

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
