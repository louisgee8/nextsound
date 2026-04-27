# nextsound - Improvement Plan

## Current State

Full-stack music discovery app (React + Node.js/Express + Spotify API). Well-architected with Redux Toolkit, lazy-loaded routes, error boundaries, and a CORS proxy server. No tests, no Docker, no CI/CD, not deployed.

## Target State

Production-grade, Dockerized, CI/CD pipeline, deployed on AWS ECS with Terraform, monitored with CloudWatch.

---

## Phase 1: Foundation

- [ ] Add Vitest + React Testing Library test suite (70%+ coverage target)
- [ ] Write production README with Mermaid architecture diagram
- [ ] Add ESLint strict config + Prettier + Husky pre-commit hooks

## Phase 2: DevOps Layer

- [ ] Create multi-stage Dockerfile (build + runtime stages, node:alpine)
- [ ] Write docker-compose.yml (frontend + backend + Redis)
- [ ] Build GitHub Actions CI/CD pipeline (lint > test > build > deploy)
- [ ] Add environment-based config management (.env.example, startup validation)

## Phase 3: Feature Upgrades

- [ ] Add /health and /ready endpoints with dependency checks
- [ ] Add structured logging (Pino or Winston, JSON format)
- [ ] Implement Redis caching for Spotify API responses (TTL-based)

## Phase 4: Deployment

- [ ] Write Terraform configs for AWS ECS Fargate + ALB + VPC
- [ ] Set up Route53 + ACM for HTTPS
- [ ] Configure CloudWatch metrics, alarms, and log groups

## Phase 5: Polish

- [ ] Record 30-60s demo GIF for README
- [ ] Prepare interview talking points doc

---

## Key Technologies to Learn

- Docker multi-stage builds, .dockerignore, non-root containers
- Docker Compose service orchestration and networking
- GitHub Actions (workflows, secrets, caching, branch protection)
- Terraform (HCL, state management, modules)
- AWS ECS Fargate, ALB, VPC, security groups, Route53, ACM
- CloudWatch (metrics, alarms, log groups)
- Redis (TTL caching, cache-aside pattern)
- Vitest, React Testing Library, test coverage
