# syntax=docker/dockerfile:1.7

# ============================================
# Stage 1: Builder
# ============================================
# Uses a full Node image to install dependencies and build the static bundle.
# This stage is heavy but gets discarded at the end.
FROM node:20-alpine AS builder

# Work inside /app. Docker creates this folder if it doesn't exist.
WORKDIR /app

# Copy only the package files first. This is a caching trick: if nothing in
# package.json / package-lock.json changed, Docker can reuse the cached
# "npm ci" layer below and skip reinstalling 800+ packages.
COPY package.json package-lock.json ./

# Install deps using the lockfile for a reproducible build.
# npm ci is stricter and faster than npm install in CI/CD pipelines.
RUN npm ci

# Now copy the rest of the source code. This layer changes often,
# which is why we kept it below the dependency install layer.
COPY . .

# Build-time env vars for Vite.
# IMPORTANT: anything VITE_* is PUBLIC — it gets baked into the static JS bundle
# and shipped to the browser. Never use VITE_ for secrets. Backend secrets stay
# in .env (which is in .dockerignore and never enters the image).
#
# These ARGs are populated by docker-compose.yml via the `args:` block. They
# only exist during this build stage, so the final nginx image carries none of
# this state — only the compiled /app/dist bundle.
ARG VITE_USE_BACKEND_PROXY
ARG VITE_PROXY_SERVER_URL
ARG VITE_ENABLE_OFFLINE_CACHE
ARG VITE_API_RETRY_ENABLED
ENV VITE_USE_BACKEND_PROXY=$VITE_USE_BACKEND_PROXY \
    VITE_PROXY_SERVER_URL=$VITE_PROXY_SERVER_URL \
    VITE_ENABLE_OFFLINE_CACHE=$VITE_ENABLE_OFFLINE_CACHE \
    VITE_API_RETRY_ENABLED=$VITE_API_RETRY_ENABLED

# Run the build. This runs tsc (type-check) then vite build (bundle).
# Output goes to /app/dist.
RUN npm run build


# ============================================
# Stage 2: Runner
# ============================================
# Tiny nginx image that just serves the static files we built in Stage 1.
# Final image size ends up around 50 MB instead of the 1+ GB the builder needs.
FROM nginx:1.27-alpine AS runner

# Copy the production build output from the builder stage into nginx's
# default web root. This is the magic of multi-stage: only the artifact
# we care about (dist/) gets carried over. All the build tools stay behind.
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default nginx server config with our SPA-aware one.
# The default config 404s on deep links like /discover or /playlist/123.
# Our config uses try_files to fall back to index.html so React Router
# can handle the route client-side. Also adds asset caching and gzip.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Phase 3 Step 3 Pass 3: http-context directives (rate-limit zone + real IP
# rewriting for Fly.io edge). Loaded with 00- prefix so it parses BEFORE
# default.conf, ensuring the `api` zone exists when default.conf references
# it via `limit_req zone=api ...`.
COPY nginx-http.conf /etc/nginx/conf.d/00-http.conf

# Document that this container listens on port 80 (HTTP).
# EXPOSE does NOT actually open the port. That happens at "docker run"
# time with the -p flag. EXPOSE is metadata for humans and tooling.
EXPOSE 80

# No CMD needed. The official nginx image already has a default CMD that
# starts nginx in the foreground, which is exactly what we want.
