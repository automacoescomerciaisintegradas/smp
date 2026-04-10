# Design: Vector Search + Admin + Ingestion (Gemini Embeddings 2 + D1)

**Date:** 2026-04-10  
**Author:** Codex  
**Status:** Approved

## Purpose
Build a multimodal semantic search pipeline (text, image, video, documents) using Gemini Embeddings 2 and store vectors + metadata in Cloudflare D1, with an admin UI and a search UI. The main app database migrates to local PostgreSQL via Prisma/NextAuth.

## Goals
- Ingest from two sources: JSON manifest and local directory.
- Generate embeddings with `gemini-embedding-2-preview` using output_dimensionality 3072.
- Store vectors and metadata in D1; store binaries in R2 (referenced by signed URLs).
- Provide a semantic search API and UI.
- Provide a full admin panel (ingestions, status, logs, reprocess, search playground).
- Migrate app data to Postgres local (Docker) and keep auth stable.

## Scope
### In Scope
- Postgres local Docker setup and Prisma datasource update.
- D1 schema for documents, chunks, embeddings, ingestion runs.
- Node CLI ingest (manifest + directory).
- Gemini embedContent integration with output_dimensionality=3072.
- Search API + UI.
- Admin UI for ingestion monitoring and reprocessing.

### Out of Scope
- ANN index persistence (Vectorize or custom ANN).
- Historical data migration from MongoDB.
- Production-grade Postgres hosting.

## Design
### Architecture
Components:
- Next.js app (UI + API routes)
- Postgres local (Prisma/NextAuth)
- Cloudflare D1 (vectors + metadata)
- Cloudflare R2 (raw media)
- Gemini API (embeddings)

Approach:
- CLI ingestion handles both input modes.
- D1 accessed via REST API from server/CLI.
- Search API computes similarity in application (cosine).
- Cache embeddings by content hash and hot query LRU.

### Data Flow
Ingestion:
1. CLI reads manifest JSON or scans a local directory.
2. Normalize into documents + chunks (text, captions, transcript, frames).
3. For each chunk, call `embedContent` with output_dimensionality=3072.
4. Write documents + chunks into D1 via REST API.
5. Store raw files in R2 (or reference existing R2 URLs).

Search:
1. User submits query.
2. API generates query embedding (Gemini).
3. API queries D1 for candidates (filters by type/tags).
4. API computes cosine similarity and returns top-K.

### Interfaces
API (server-only):
- POST /api/search
- GET /api/admin/ingestions
- POST /api/admin/ingest
- POST /api/admin/reindex
- GET /api/admin/documents

CLI:
- node scripts/ingest --manifest path.json
- node scripts/ingest --dir ./assets --r2-bucket <bucket>
- Flags: --dry-run --limit --only-type --resume --reembed --output-dim 3072

UI:
- /search for semantic search
- /admin for full admin panel

## Alternatives Considered
1. Approach 1: D1 only, no cache. Rejected due to latency at scale.
2. Approach 2: D1 + cache by batch and LRU. Chosen for balance.
3. Approach 3: ANN index in R2. Deferred for complexity.

## Testing Strategy
- Unit tests: manifest parsing, chunking, hashing, embed caching.
- Integration tests: D1 writes/reads, search API with mocked embeddings.
- E2E tests: search UI, admin ingestion and reprocess flows.

## Risks and Mitigations
- Secret exposure: keep values in .env only.
- D1 latency: use filters + LRU cache.
- Gemini cost: cache by content hash and avoid re-embedding.
- R2/D1 mismatch: ingestion status and reprocess tooling.
