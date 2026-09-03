# ProductIQ Architecture Documentation

## 1. Executive Summary & System Overview

ProductIQ is an enterprise-grade Product Intelligence, Duplicate Detection, Risk Assessment, and Hybrid Search platform built using **Clean Architecture** principles on **ASP.NET Core 10 (.NET 10)**, **React 18 + TypeScript + Vite**, and **PostgreSQL 16 with pgvector**.

The platform processes large-scale product catalogs (e.g. Amazon Berkeley Objects dataset), computes 7-signal duplicate similarity scores, detects catalog risk anomalies, executes vector-based semantic and hybrid search queries, and provides AI-driven natural language explanations.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Layer"]
        User["User / Administrator"]
        Browser["React 18 SPA (TypeScript + Vite)"]
    end

    subgraph ReverseProxy ["Reverse Proxy & Container Gateway"]
        Nginx["Nginx Reverse Proxy (Port 3000)<br/>SPA Static Host & API Gateway"]
    end

    subgraph BackendApp ["Backend Application (ASP.NET Core .NET 10)"]
        API["API Layer<br/>Controllers & JWT Bearer Middleware"]
        App["Application Layer<br/>Use Cases, DTOs & Services"]
        Domain["Domain Layer<br/>Entities, Enums & Specifications"]
        Infra["Infrastructure Layer<br/>EF Core, Auth, AI & Repositories"]
    end

    subgraph Storage ["Database Layer"]
        Postgres[("PostgreSQL 16 + pgvector<br/>(Port 5433 -> 5432)")]
        Volume[("Persistent Data Volume<br/>productiq_pgdata")]
    end

    subgraph AIServices ["AI & Embedding Engines"]
        OpenAI_Embed["OpenAI API<br/>text-embedding-3-small (1536d)"]
        OpenAI_LLM["OpenAI API<br/>gpt-4o-mini (Explanations)"]
        CLIP_ONNX["Local CLIP Model<br/>clip-vit-base-patch32 (512d ONNX)"]
    end

    User -->|HTTP Requests| Browser
    Browser -->|Port 3000| Nginx
    Nginx -->|Static Assets| Browser
    Nginx -->|/api/* -> http://backend:5000/api/| API

    API --> App
    App --> Domain
    App --> Infra
    Infra --> Domain

    Infra -->|Npgsql / EF Core| Postgres
    Postgres --- Volume

    Infra -->|HTTPS| OpenAI_Embed
    Infra -->|HTTPS| OpenAI_LLM
    Infra -->|ONNX Runtime| CLIP_ONNX
```

---

## 3. Container & Deployment Architecture (Docker Compose)

The entire ProductIQ platform is containerized and orchestrated via **Docker Compose** on an isolated bridge network (`productiq-network`).

```mermaid
graph LR
    subgraph HostMachine ["Host System"]
        HostPort3000["Host Port 3000"]
        HostPort5003["Host Port 5003"]
        HostPort5433["Host Port 5433"]
    end

    subgraph DockerCompose ["Docker Compose Environment (productiq-network)"]
        subgraph FrontendContainer ["productiq-frontend (nginx:alpine)"]
            NginxServer["Nginx Web Server (Port 80)"]
        end

        subgraph BackendContainer ["productiq-backend (mcr.microsoft.com/dotnet/aspnet:10.0)"]
            Kestrel["Kestrel Web Server (Port 5000)<br/>ASPNETCORE_ENVIRONMENT=Development"]
        end

        subgraph PostgresContainer ["productiq-postgres (pgvector/pgvector:pg16)"]
            DBEngine["PostgreSQL 16 Engine (Port 5432)<br/>Extension: vector 0.8.6"]
        end

        VolumeData[("productiq_pgdata")]
    end

    HostPort3000 -->|Port Mapping 3000:80| NginxServer
    HostPort5003 -->|Port Mapping 5003:5000| Kestrel
    HostPort5433 -->|Port Mapping 5433:5432| DBEngine

    NginxServer -->|Internal Proxy http://backend:5000/api/| Kestrel
    Kestrel -->|Host=postgres;Port=5432| DBEngine
    DBEngine --- VolumeData
```

---

## 4. Clean Architecture Layer Breakdown

ProductIQ strictly separates business logic, application orchestration, external integrations, and delivery endpoints using Clean Architecture.

```mermaid
graph BT
    API["ProductIQ.API<br/>(Controllers, Middleware, Swagger)"]
    Infra["ProductIQ.Infrastructure<br/>(EF Core, PostgreSQL, Auth, OpenAI, CLIP)"]
    App["ProductIQ.Application<br/>(Interfaces, Services, DTOs, Mappers)"]
    Domain["ProductIQ.Domain<br/>(Entities, Enums, Specifications)"]

    API --> App
    Infra --> App
    App --> Domain
    API --> Infra
```

### A. Domain Layer (`ProductIQ.Domain`)
Contains core business entities and value objects without any external framework dependencies.
* **Entities**:
  - `Product`: Core entity storing normalized title, brand, category, model name, model number, price, currency, main image URL, and specifications.
  - `ProductImage`: Associated product images and thumbnail URLs.
  - `ProductAttribute`: Key-value technical specifications (e.g. Color, Connectivity, DPI).
  - `ProductEmbedding`: Stores 1536-dimensional text vector (`text-embedding-3-small`) or 512-dimensional visual vector (`clip-vit-base-patch32`) as `pgvector` data types.
  - `DuplicateCandidate`: Candidate duplicate pair (`ProductA`, `ProductB`) with confidence score, 7-signal breakdown, and status (`Potential`, `Confirmed`, `Rejected`).
  - `DuplicateSignal`: Individual signal breakdown (Brand, Category, Model, Text, Semantic, Attribute, Image).
  - `User`: Platform user entity with PBKDF2 password hash, role (`Admin` / `User`), and active state.
  - `SystemSetting`: Runtime configuration key-values (Candidate Threshold, Auto-Merge Threshold, OpenAI features).
* **Enums**: `UserRole`, `CandidateStatus`, `EmbeddingType`, `SearchMode`.

### B. Application Layer (`ProductIQ.Application`)
Defines business use-cases, DTO contracts, mapping profiles, and service interfaces.
* **Interfaces**: `IProductIQDbContext`, `IAuthService`, `ISimilaritySearchService`, `ISearchService`, `IAnalyticsService`, `ISettingsService`, `IPasswordHasher`, `IJwtTokenGenerator`, `IEmbeddingService`, `IClipImageEmbeddingService`, `IExplanationLlmService`.
* **Services**: `ProductService`, `DuplicateScoringService`, `RiskDetectionService`, `SearchService`, `AnalyticsService`, `SettingsService`.

### C. Infrastructure Layer (`ProductIQ.Infrastructure`)
Implements data persistence, external AI integrations, authentication services, and database seeders.
* **Database Context**: `ProductIQDbContext` configured with Npgsql and `UseVector()`.
* **Authentication**: `PasswordHasher` (PBKDF2 with salt) and `JwtTokenGenerator` (Symmetric HMAC-SHA256).
* **AI Integrations**:
  - `OpenAiEmbeddingService`: HTTP client for OpenAI 1536d text embeddings.
  - `ClipImageEmbeddingService`: Local ONNX Runtime inference for 512d visual embeddings.
  - `OpenAiExplanationLlmService`: LLM rationale generator for duplicate and risk analyses.
* **Database Seeder**: `UserSeeder` seeds default `admin@productiq.internal` and `user@productiq.internal` accounts on application startup.

### D. API Layer (`ProductIQ.API`)
HTTP REST controllers, OpenAPI/Swagger specifications, and global middleware.
* **Controllers**: `AuthController`, `ProductsController`, `DuplicateCandidatesController`, `RiskController`, `SearchController`, `AnalyticsController`, `SettingsController`.
* **Middleware**: `GlobalExceptionHandler` returning RFC 7807 `ProblemDetails`, JWT Bearer Authentication, and CORS policies.

---

## 5. Authentication & Authorization Sequence Flow

ProductIQ implements stateless JWT (JSON Web Token) authentication paired with Role-Based Access Control (RBAC).

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Admin
    participant Frontend as React Client
    participant Proxy as Nginx Gateway
    participant API as ASP.NET Core API
    participant Auth as AuthService & PasswordHasher
    participant DB as PostgreSQL

    User->>Frontend: Submit credentials (Email, Password)
    Frontend->>Proxy: POST /api/auth/login
    Proxy->>API: Forward POST /api/auth/login
    API->>Auth: ValidateCredentialsAsync(email, password)
    Auth->>DB: Query User by normalized Email
    DB-->>Auth: User Entity (PasswordHash, Salt, Role)
    Auth->>Auth: Verify PBKDF2 Hash Match
    Auth->>Auth: Generate JWT Token (Claims: sub, email, role)
    Auth-->>API: AuthResponse (Token, Expiration, UserProfile)
    API-->>Proxy: 200 OK Json
    Proxy-->>Frontend: 200 OK Json
    Frontend->>Frontend: Save Token to localStorage

    Note over Frontend, API: Authenticated Request Execution
    User->>Frontend: Click "Run Detection" (Admin Action)
    Frontend->>Proxy: POST /api/duplicate-candidates/detect (Header: Bearer Token)
    Proxy->>API: Forward Request with Authorization Header
    API->>API: JwtBearerMiddleware Validates Token Signature & Expiration
    API->>API: Evaluate Authorization Policy [AdminOnly]
    alt Is Admin
        API->>DB: Execute Batch Duplicate Detection Pipeline
        DB-->>API: Detection Completed
        API-->>Frontend: 200 OK Success Payload
    else Is Standard User
        API-->>Frontend: 403 Forbidden Response
    end
```

---

## 6. Duplicate Detection 7-Signal Scoring Pipeline

Duplicate Detection executes a 3-tier analysis pipeline to identify potential catalog duplicates with high precision.

```mermaid
flowchart TD
    Catalog["Catalog Products (PostgreSQL)"] --> Blocking["1. Candidate Generation (Blocking Rules)"]
    
    Blocking -->|Matches Brand, Category, Model or Vector Distance| Pair["Candidate Product Pair (ProductA, ProductB)"]
    
    Pair --> Signal1["1. Brand Match Score (Weight: 0.15)"]
    Pair --> Signal2["2. Category Match Score (Weight: 0.15)"]
    Pair --> Signal3["3. Model Match Score (Weight: 0.15)"]
    Pair --> Signal4["4. Text Overlap Score (Weight: 0.15)"]
    Pair --> Signal5["5. Semantic Vector Similarity (Weight: 0.15)<br/>pgvector Cosine Distance"]
    Pair --> Signal6["6. Technical Attribute Match (Weight: 0.10)"]
    Pair --> Signal7["7. Visual Image Similarity (Weight: 0.15)<br/>CLIP ONNX Vector Similarity"]

    Signal1 --> WeightedSum["Composite Similarity Score Calculation"]
    Signal2 --> WeightedSum
    Signal3 --> WeightedSum
    Signal4 --> WeightedSum
    Signal5 --> WeightedSum
    Signal6 --> WeightedSum
    Signal7 --> WeightedSum

    WeightedSum --> Evaluation{"Score >= CandidateThreshold (e.g. 0.50)"}

    Evaluation -->|Yes| SaveCandidate["Save DuplicateCandidate (Status: Potential)"]
    Evaluation -->|No| Discard["Discard Candidate Pair"]

    SaveCandidate --> LLMExpl["Optional: Generate AI Explanation via OpenAI LLM"]
    LLMExpl --> Queue["Available in Recent Duplicate Reviews Queue"]
```

---

## 7. Search Architecture (Keyword, Semantic & Hybrid Modes)

The Search Playground supports 3 distinct search strategies using lexical matching, vector cosine distance, and Reciprocal Rank Fusion (RRF).

```mermaid
graph TD
    Query["User Search Query"] --> Analysis["Query Analysis Engine<br/>(Extracts Tokens, Brand, Category & Intent)"]

    Analysis --> ModeChoice{"Search Mode Selected"}

    ModeChoice -->|Keyword Mode| Lexical["PostgreSQL Lexical Search<br/>ILIKE Matching on Title, Brand, Model"]
    
    ModeChoice -->|Semantic Mode| Vector["pgvector Cosine Distance Search<br/>1536d Text Embedding Distance (<=>)"]

    ModeChoice -->|Hybrid Mode| Both["Execute Both Lexical & Semantic Searches"]

    Lexical --> RawLexical["Ranked Lexical Results"]
    Vector --> RawVector["Ranked Vector Results"]

    Both --> RRF["Reciprocal Rank Fusion (RRF) Merger<br/>RRF_Score = 1 / (60 + Rank_Lexical) + 1 / (60 + Rank_Vector)"]

    RawLexical --> FinalResults["Format Search Response"]
    RawVector --> FinalResults
    RRF --> FinalResults

    FinalResults --> UI["Display Search Result Cards & Tokens on Frontend"]
```

---

## 8. Database Schema Overview (PostgreSQL + pgvector)

```mermaid
erDiagram
    users {
        uuid Id PK
        string Email UK
        string PasswordHash
        string FirstName
        string LastName
        int Role
        boolean IsActive
        timestamp CreatedAt
        timestamp LastLoginAt
    }

    products {
        uuid Id PK
        string AmazonItemId UK
        string Name
        string Title
        string Brand
        string Category
        string ProductType
        decimal Price
        string Currency
        int RiskScore
    }

    product_images {
        uuid Id PK
        uuid ProductId FK
        string ImageUrl
        boolean IsMain
    }

    product_attributes {
        uuid Id PK
        uuid ProductId FK
        string Key
        string Value
    }

    product_embeddings {
        uuid Id PK
        uuid ProductId FK
        int EmbeddingType
        string ModelName
        vector Vector
    }

    duplicate_candidates {
        uuid Id PK
        uuid ProductAId FK
        uuid ProductBId FK
        double OverallScore
        int Status
    }

    duplicate_signals {
        uuid Id PK
        uuid CandidateId FK
        string SignalType
        double Score
        double Weight
    }

    system_settings {
        uuid Id PK
        string Key UK
        string Value
        string Category
    }

    products ||--o{ product_images : "has"
    products ||--o{ product_attributes : "has"
    products ||--o{ product_embeddings : "has"
    products ||--o{ duplicate_candidates : "ProductA"
    products ||--o{ duplicate_candidates : "ProductB"
    duplicate_candidates ||--o{ duplicate_signals : "contains"
```

---

## 9. Verification & Quality Matrix

ProductIQ maintains comprehensive test coverage across unit, integration, benchmark evaluation, and frontend end-to-end layers:

| Layer | Project / Suite | Test Count | Pass Rate | Scope |
|:---|:---|:---:|:---:|:---|
| **Backend Unit Tests** | `ProductIQ.UnitTests` | 76 | %100 | Domain entities, auth services, scoring logic, search analysis |
| **Backend Integration Tests** | `ProductIQ.IntegrationTests` | 92 | %100 | Real PostgreSQL + pgvector, full HTTP pipeline, JWT auth, RBAC policies |
| **ABO Benchmark Evaluation** | `Ground Truth Suite` | 500 pairs | %100 Recall | ABO catalog evaluation set (Recall: 100%, Precision: 99.31% at threshold 0.50) |
| **Frontend Tests** | `Vitest + Testing Library` | 71 | %100 | AuthContext, ProtectedRoute, RBAC UI, components, end-to-end user flows |
| **TOTAL** | | **239 tests (+500 pairs)** | **%100** | **Clean build, 0 errors, 0 regressions** |