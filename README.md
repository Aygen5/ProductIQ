# ProductIQ ⚡

> **Enterprise-Grade Product Intelligence, Duplicate Detection, Risk Assessment & Hybrid Search Platform**

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/pgvector-0.8.6-336791?style=flat-square)](https://github.com/pgvector/pgvector)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-239%20Passed%20(100%25)-success?style=flat-square)](https://github.com/)

---

## 1. Project Overview

**ProductIQ** is an enterprise catalog intelligence platform engineered to analyze large-scale e-commerce catalogs (such as the Amazon Berkeley Objects dataset). It automatically resolves duplicate catalog items using a multi-signal algorithmic scoring engine, identifies catalog pricing and seller risk anomalies, enables vector-powered semantic and hybrid search, and provides AI-driven natural language explanations for human review.

Built on **ASP.NET Core 10** following **Clean Architecture** principles and paired with a high-performance **React 18** Single Page Application, ProductIQ is designed for horizontal scalability, data integrity, and seamless containerized deployments.

---

## 2. Key Features

* **7-Signal Duplicate Detection Engine**: Combines lexical, exact-field, semantic vector, attribute, and visual embeddings into a weighted composite score (0.00 – 1.00).
* **Multi-Modal AI Pipeline**: Integrates OpenAI `text-embedding-3-small` (1536-dim), local `CLIP` ONNX (512-dim visual vectors), and `GPT-4o-mini` for human-readable audit explanations.
* **Hybrid Search (Keyword + Semantic + RRF)**: High-speed lexical search (`ILIKE`) fused with cosine vector distance (`pgvector <=>`) via Reciprocal Rank Fusion (RRF).
* **Deterministic Risk Detection**: Analyzes price anomalies, missing attributes, seller irregularities, and brand mismatch signals with category-level safety thresholds.
* **Role-Based Access Control (RBAC)**: Distinct permissions and interface modes for `Standard User` (read-only audit) and `System Admin` (batch pipeline execution, threshold configuration, system reset).
* **Catalog Health Time Series**: Real-time quality index tracking duplicate and health trends across 7-day, 30-day, and 90-day intervals.
* **One-Click Docker Orchestration**: Complete multi-container deployment (`Frontend + Backend + PostgreSQL + pgvector`) with automated EF Core migration and database seeding on boot.

---

## 3. Tech Stack

| Layer | Technology / Framework | Details |
|:---|:---|:---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Lucide React icons, Context API state management |
| **Backend API** | ASP.NET Core 10 (.NET 10), C# 13 | Clean Architecture (Domain, Application, Infrastructure, API) |
| **Persistence** | PostgreSQL 16 + pgvector 0.8.6, EF Core 10 | Relational schema, HNSW/IVFFlat vector indexing, migrations |
| **Authentication** | JWT Bearer, PBKDF2 with HMAC-SHA256 & Salt | Stateless token authentication, Claims-based RBAC |
| **AI & ML** | OpenAI API & ONNX Runtime | `text-embedding-3-small` (1536d), `clip-vit-base-patch32` (512d) |
| **Reverse Proxy** | Nginx Alpine | Client-side routing (`try_files`), transparent `/api/*` proxy |
| **Testing** | xUnit, FluentAssertions, Moq, Vitest, Testing Library | 239 automated tests (76 Unit, 92 Integration, 71 Frontend) |
| **Containerization**| Docker, Docker Compose | Multi-stage builds, internal bridge network, persistent volumes |

---

## 4. System Architecture

ProductIQ enforces strict unidirectional dependencies following Clean Architecture:

```
                  ┌─────────────────────────────────┐
                  │          React 18 SPA           │ (Port 3000)
                  └───────────────┬─────────────────┘
                                  │ HTTP / JSON
                                  ▼
                  ┌─────────────────────────────────┐
                  │       Nginx Reverse Proxy       │
                  └───────────────┬─────────────────┘
                                  │ /api/*
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                     ASP.NET Core Web API                          │ (Port 5003)
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ API Layer (Controllers, JWT Middleware, Exception Handler)    │ │
│ └───────────────────────────────┬───────────────────────────────┘ │
│                                 ▼                                 │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ Application Layer (Use Cases, DTOs, Scoring, Search Engine)   │ │
│ └───────────────────────────────┬───────────────────────────────┘ │
│                                 ▼                                 │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ Domain Layer (Entities, Value Objects, Enums, Specifications) │ │
│ └───────────────────────────────▲───────────────────────────────┘ │
│                                 │                                 │
│ ┌───────────────────────────────┴───────────────────────────────┐ │
│ │ Infrastructure Layer (EF Core, Auth, OpenAI, CLIP ONNX)       │ │
│ └───────────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────────┼─────────────────────────────────┘
                                  │
                  ┌───────────────┴─────────────────┐
                  ▼                                 ▼
    ┌───────────────────────────┐     ┌───────────────────────────┐
    │  PostgreSQL 16 + pgvector │     │    External AI Services   │
    │  (Port 5433 -> 5432)      │     │    OpenAI & CLIP ONNX     │
    └───────────────────────────┘     └───────────────────────────┘
```

> Detailed architecture diagrams, layer breakdowns, and sequence flows are available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 5. Intelligence Pipelines

### 7-Signal Duplicate Scoring Engine

Candidates are generated via fast blocking rules (matching Brand, Category, Model, or Vector cosine distance) and scored across 7 distinct signals:

| Signal | Evaluation Strategy | Default Weight | Description |
|:---|:---|:---:|:---|
| **1. Brand Match** | Normalized Exact Match | `0.15` | `1.0` if brands match, `0.0` if different |
| **2. Category Match**| Hierarchical Node Overlap| `0.15` | Taxonomic path similarity ratio |
| **3. Model Match** | Exact Model / MPN Check | `0.15` | Manufacturer part number verification |
| **4. Text Similarity**| Normalized Levenshtein / Token | `0.15` | Product title & description lexical overlap |
| **5. Semantic Vector**| `pgvector` Cosine Distance | `0.15` | OpenAI 1536-dim text embedding proximity |
| **6. Attributes** | Key-Value Feature Match | `0.10` | Matching specifications (Color, Size, DPI, etc.) |
| **7. Visual Image** | CLIP ONNX Vector Similarity | `0.15` | 512-dim visual image representation similarity |

$$\text{Composite Score} = \sum_{i=1}^{7} (\text{Signal}_i \times \text{Weight}_i)$$

* **Candidate Threshold**: Defaults to `0.50` (achieves **99.31% precision** and **100% candidate generation recall** on the ABO benchmark).
* **Auto-Merge Threshold**: Defaults to `0.95`.

---

### Hybrid Search Engine

The search playground supports 3 dynamic retrieval modes:
1. **Keyword Mode**: Fast PostgreSQL `ILIKE` lexical matching over title, brand, and model fields.
2. **Semantic Mode**: Vector similarity query via `pgvector` cosine distance operator (`<=>`).
3. **Hybrid Mode**: Executes both passes concurrently and combines them via **Reciprocal Rank Fusion (RRF)**:
   $$\text{RRF Score} = \frac{1}{60 + \text{Rank}_{\text{Lexical}}} + \frac{1}{60 + \text{Rank}_{\text{Vector}}}$$

---

## 6. UI Overview

* **Dashboard**: Key performance indicators, Catalog Health time series (7D/30D/90D SVG graph), and recent duplicate reviews queue.
* **Product Catalog**: Paginated table with brand/category filters, sorting, search, and technical product drawer.
* **Duplicate Queue & Detail**: Side-by-side technical attribute comparison, radar visual score distribution, AI explanation cards, and Confirm/Reject actions.
* **Search Playground**: Natural language query token analysis, multi-mode selector (Keyword / Semantic / Hybrid), and relevance-scored product cards.
* **System Settings**: Real-time threshold sliders, AI feature toggles, and administrator factory reset.

---

## 7. Quickstart with Docker Compose

The fastest way to spin up the entire platform is with Docker Compose:

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+) with Docker Compose enabled.

### Run in One Command

```bash
# Clone the repository
git clone https://github.com/Aygen5/ProductIQ.git
cd ProductIQ

# Copy environment template
cp .env.example .env

# Build and start all containers
docker compose up -d --build
```

### Access Services

| Service | URL | Default Credentials |
|:---|:---|:---|
| **Web Frontend** | [http://localhost:3000](http://localhost:3000) | `admin@productiq.internal` / `Admin123!*`<br/>`user@productiq.internal` / `User123!*` |
| **Backend API & Swagger**| [http://localhost:5003/swagger](http://localhost:5003/swagger) | Requires Bearer JWT token |
| **PostgreSQL (pgvector)** | `localhost:5433` | User: `postgres` / Pass: `postgres` / DB: `productiq_db` |

> On first boot, the backend automatically runs `dbContext.Database.MigrateAsync()` to initialize PostgreSQL tables, enables the `vector` extension, and seeds default accounts.

---

## 8. Local Development Setup

If running without Docker:

### 1. Database
Ensure a PostgreSQL 16 instance with the `vector` extension is accessible on port `5433` (or update `appsettings.json`).

### 2. Backend (.NET 10)
```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/ProductIQ.API
```
*API will be listening at `http://localhost:5003`.*

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server will start at `http://localhost:5173`.*

---

## 9. Environment Configuration

All environment variables are centralized and can be customized via `.env`:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=productiq_db
POSTGRES_PORT=5433

# Application Ports
BACKEND_PORT=5003
FRONTEND_PORT=3000
ASPNETCORE_ENVIRONMENT=Development

# Authentication (JWT)
JWT_ISSUER=ProductIQ.API
JWT_AUDIENCE=ProductIQ.Client
JWT_KEY=ProductIQ_SuperSecret_Jwt_SigningKey_2026_Development_Min32Chars!

# External AI Services (Optional)
OPENAI_API_KEY=

# Frontend API URL (defaults to /api via reverse proxy)
VITE_API_URL=/api
```

---

## 10. API Reference

ProductIQ exposes 24 RESTful endpoints across 7 service controllers:

* **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
* **Products**: `/api/products`, `/api/products/{id}`, `/api/products/import`
* **Duplicate Candidates**: `/api/duplicate-candidates`, `/api/duplicate-candidates/summary`, `/api/duplicate-candidates/{id}`, `/api/duplicate-candidates/detect`, `/api/duplicate-candidates/{id}/confirm`, `/api/duplicate-candidates/{id}/reject`
* **Search**: `/api/search`, `/api/search/analyze`
* **Analytics**: `/api/analytics`, `/api/analytics/catalog-health`, `/api/analytics/risk`, `/api/analytics/duplicates`
* **Settings**: `/api/settings`, `/api/settings/similarity`, `/api/settings/risk`, `/api/settings/reset`
* **Health**: `/api/health`

> Complete endpoint parameters, request bodies, and JSON responses are detailed in [`docs/api.md`](docs/api.md).

---

## 11. Testing & Quality Assurance

ProductIQ features a 100% passing test suite across all architectural layers:

```bash
# Run all Backend Unit & Integration Tests (168 tests)
dotnet test backend/ProductIQ.slnx

# Run all Frontend Component & E2E User Flow Tests (71 tests)
cd frontend && npm run test

# Run ABO Duplicate Detection Evaluation Benchmark (500 pairs)
dotnet run --project backend/src/ProductIQ.DataImporter -- --evaluate-duplicates
```

| Test Suite | Framework | Total Tests | Pass Rate |
|:---|:---|:---:|:---:|
| **Backend Unit Tests** | xUnit, FluentAssertions, Moq | 76 | **100%** |
| **Backend Integration Tests**| `WebApplicationFactory`, PostgreSQL 16 | 92 | **100%** |
| **Frontend Component & Flows**| Vitest, React Testing Library, jsdom | 71 | **100%** |
| **ABO Ground Truth Benchmark**| Evaluation Engine (500 real catalog pairs) | 500 | **100% Recall** |
| **TOTAL** | | **239 tests (+500 pairs)** | **100%** |

---

## 12. Project Structure

```
ProductIQ/
├── .env.example                   # Environment configuration template
├── .gitignore                     # Repository exclusion rules
├── docker-compose.yml             # Multi-container Docker Compose definition
├── README.md                      # Primary project documentation
├── docs/                          # Specialized documentation
│   ├── ARCHITECTURE.md            # In-depth architectural designs & diagrams
│   ├── api.md                     # Complete REST API reference
│   ├── PROJECT.md                 # Product specifications & requirements
│   └── ROADMAP.md                 # Evolution phases and milestone tracker
├── backend/                       # .NET 10 Solution
│   ├── Dockerfile                 # Backend multi-stage container build
│   ├── ProductIQ.slnx             # Visual Studio Solution
│   ├── src/
│   │   ├── ProductIQ.Domain/      # Entities, Enums, Value Objects
│   │   ├── ProductIQ.Application/ # Business services, DTOs, interfaces
│   │   ├── ProductIQ.Infrastructure/ # EF Core, PostgreSQL, pgvector, AI
│   │   ├── ProductIQ.API/         # Controllers, Middleware, Swagger
│   │   └── ProductIQ.DataImporter/# ABO catalog batch importer & evaluator
│   └── tests/
│       ├── ProductIQ.UnitTests/   # Domain & application unit tests
│       └── ProductIQ.IntegrationTests/ # Real database & API pipeline tests
└── frontend/                      # React 18 SPA
    ├── Dockerfile                 # Frontend multi-stage Nginx container build
    ├── nginx.conf                 # SPA routing & API gateway reverse proxy
    ├── package.json               # Frontend dependencies & scripts
    ├── vite.config.ts             # Vite & Vitest configuration
    └── src/
        ├── components/            # Reusable UI components & modals
        ├── context/               # Authentication & session context
        ├── pages/                 # Full view pages (Dashboard, Search, etc.)
        ├── services/              # API clients & token storage
        └── test/                  # Component & integration test suites
```

---

## 13. License

This project is licensed under the [MIT License](LICENSE).
