# ProductIQ API Reference Documentation

## 1. Overview & Conventions

ProductIQ provides a RESTful HTTP API built with **ASP.NET Core 10 (.NET 10)** following Clean Architecture principles.

* **Base URL (Direct Backend)**: `http://localhost:5003`
* **Base URL (Docker Nginx Gateway)**: `http://localhost:3000/api`
* **Interactive Swagger UI**: `http://localhost:5003/swagger`
* **OpenAPI v1 Specification**: `http://localhost:5003/swagger/v1/swagger.json`
* **Content-Type**: `application/json`
* **Standard Time Format**: ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`)
* **Identifiers**: Standard UUIDv4 (`00000000-0000-0000-0000-000000000000`) or External SKU/ASIN (`B001MX3S`).

---

## 2. Authentication & Authorization

All private endpoints require a valid JWT (JSON Web Token) sent via the HTTP `Authorization` header:

```http
Authorization: Bearer <jwt_access_token>
```

### Roles & Policies

| Policy Name | Attribute | Permitted Roles | Behavior if Unauthorized / Forbidden |
|:---|:---|:---|:---|
| **Public / Anonymous** | `[AllowAnonymous]` | Anyone | No token required |
| **Authenticated User** | `[Authorize]` | `User`, `Admin` | `401 Unauthorized` if token missing/expired |
| **Admin Only** | `[Authorize(Policy = "AdminOnly")]` | `Admin` | `401 Unauthorized` if no token; `403 Forbidden` if role is `User` |

### Error Handling Standard (RFC 7807 ProblemDetails)

All `4xx` and `5xx` error responses return standardized RFC 7807 `ProblemDetails` objects:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.4",
  "title": "Forbidden",
  "status": 403,
  "detail": "User does not have the required role or permission to perform this action.",
  "instance": "/api/settings"
}
```

---

## 3. Endpoints Matrix Summary

| Area | HTTP Method | Endpoint Route | Access Policy | Description |
|:---|:---:|:---|:---:|:---|
| **Auth** | `POST` | `/api/auth/register` | Anonymous | Register a new user account |
| **Auth** | `POST` | `/api/auth/login` | Anonymous | Authenticate credentials and receive JWT |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| **Products** | `GET` | `/api/products` | Authenticated | Query paged product catalog with filters |
| **Products** | `GET` | `/api/products/{id}` | Authenticated | Retrieve product details by GUID or ASIN |
| **Products** | `POST` | `/api/products` | Authenticated | Create a new product entry |
| **Products** | `POST` | `/api/products/import` | Authenticated | Trigger batch import from ABO dataset |
| **Duplicates** | `GET` | `/api/duplicate-candidates` | Authenticated | Get paged duplicate candidate queue |
| **Duplicates** | `GET` | `/api/duplicate-candidates/summary` | Authenticated | Get high-level duplicate queue statistics |
| **Duplicates** | `GET` | `/api/duplicate-candidates/{id}` | Authenticated | Get candidate detail, 7 signals & explanations |
| **Duplicates** | `GET` | `/api/duplicate-candidates/{id}/risk` | Authenticated | Get risk assessment for candidate pair |
| **Duplicates** | `POST` | `/api/duplicate-candidates/detect` | **Admin Only** | Run batch duplicate detection algorithm |
| **Duplicates** | `POST`/`PATCH` | `/api/duplicate-candidates/{id}/confirm` | Authenticated | Confirm duplicate candidate merge |
| **Duplicates** | `POST`/`PATCH` | `/api/duplicate-candidates/{id}/reject` | Authenticated | Reject candidate (keep products distinct) |
| **Duplicates** | `POST`/`PATCH` | `/api/duplicate-candidates/{id}/reopen` | Authenticated | Reopen candidate to Potential status |
| **Duplicates** | `PATCH` | `/api/duplicate-candidates/{id}/status` | Authenticated | Update status with resolution notes |
| **Search** | `GET` | `/api/search` | Authenticated | Execute keyword, semantic or hybrid search |
| **Search** | `POST` | `/api/search` | Authenticated | Execute search with JSON request body |
| **Search** | `GET` | `/api/search/analyze` | Authenticated | Analyze search query into semantic tokens |
| **Analytics** | `GET` | `/api/analytics` | Authenticated | Get overall system analytics summary |
| **Analytics** | `GET` | `/api/analytics/catalog` | Authenticated | Get catalog volume and attribute analytics |
| **Analytics** | `GET` | `/api/analytics/duplicates` | Authenticated | Get duplicate detection rates & precision |
| **Analytics** | `GET` | `/api/analytics/risk` | Authenticated | Get catalog risk metrics & alert counts |
| **Analytics** | `GET` | `/api/analytics/search` | Authenticated | Get search volume & zero-result rates |
| **Analytics** | `GET` | `/api/analytics/catalog-health` | Authenticated | Get Catalog Health time-series (7D/30D/90D) |
| **Settings** | `GET` | `/api/settings` | Authenticated | Retrieve complete system settings |
| **Settings** | `PUT` | `/api/settings` | **Admin Only** | Update runtime similarity & risk thresholds |
| **Settings** | `GET` | `/api/settings/similarity` | Authenticated | Get similarity scoring weights & thresholds |
| **Settings** | `GET` | `/api/settings/risk` | Authenticated | Get risk scoring weights & thresholds |
| **Settings** | `GET` | `/api/settings/ai` | Authenticated | Get OpenAI model & explanation settings |
| **Settings** | `GET` | `/api/settings/notification` | Authenticated | Get system notification settings |
| **Settings** | `POST` | `/api/settings/reset` | **Admin Only** | Reset all settings to default values |
| **Health** | `GET` | `/api/health` | Anonymous | Service and database health check |

---

## 4. Endpoint Specifications

### 4.1 Authentication API (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user profile with standard `User` role.

* **Authorization**: Anonymous
* **Request Body**:
  ```json
  {
    "email": "analyst@example.com",
    "password": "StrongPassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
* **Responses**:
  - `201 Created`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2026-09-04T12:00:00Z",
      "user": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "email": "analyst@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "User",
        "createdAt": "2026-09-03T12:00:00Z",
        "lastLoginAt": null
      }
    }
    ```
  - `400 Bad Request`: Email already registered or invalid fields.

---

#### `POST /api/auth/login`
Authenticates email and password, returning a JWT token with user claims.

* **Authorization**: Anonymous
* **Request Body**:
  ```json
  {
    "email": "admin@productiq.internal",
    "password": "Admin123!*"
  }
  ```
* **Responses**:
  - `200 OK`: Returns `AuthResponseDto` with JWT token.
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account deactivated (`isActive == false`).

---

#### `GET /api/auth/me`
Retrieves the profile of the currently authenticated token subject.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Responses**:
  - `200 OK`: Returns `UserProfileDto`.
  - `401 Unauthorized`: Missing or expired token.
  - `404 Not Found`: User no longer exists in database.

---

### 4.2 Products API (`/api/products`)

#### `GET /api/products`
Retrieves a paginated list of catalog products with optional filtering and sorting.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Query Parameters**:
  - `page` (int, default: 1, min: 1)
  - `pageSize` (int, default: 20, min: 1, max: 100)
  - `search` (string, optional): Text filter on name, brand, model.
  - `brand` (string, optional): Exact brand filter.
  - `category` (string, optional): Category filter.
  - `productType` (string, optional): Product type filter.
  - `sortBy` (string, optional): `name`, `brand`, `category`, `producttype`, `price`, `createdat`.
  - `sortDirection` (string, optional): `asc` or `desc`.
* **Responses**:
  - `200 OK`:
    ```json
    {
      "items": [
        {
          "id": "d04df16b-1933-4318-8f81-56ea2b8813a0",
          "amazonItemId": "B07PGL2ZSL",
          "name": "Logitech MX Master 3S Wireless Mouse",
          "brand": "Logitech",
          "category": "Electronics/Computers/Mice",
          "nodePath": "Computers > Mice",
          "productType": "Mouse",
          "mainImageUrl": "https://images.example.com/item.jpg",
          "price": 99.99,
          "currency": "USD",
          "createdAt": "2026-08-20T10:00:00Z"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalCount": 9220,
      "totalPages": 461,
      "hasPreviousPage": false,
      "hasNextPage": true
    }
    ```
  - `400 Bad Request`: `page < 1` or `pageSize > 100`.
  - `401 Unauthorized`: Unauthenticated.

---

#### `GET /api/products/{id}`
Retrieves full technical details, attributes, and images for a specific product.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Route Parameter**:
  - `id` (string): Either Product GUID (`uuid`) or Amazon Item ID / ASIN (`B07PGL2ZSL`).
* **Responses**:
  - `200 OK`: Returns `ProductDetailDto` with `attributes` and `images` arrays.
  - `401 Unauthorized`: Unauthenticated.
  - `404 Not Found`: Product not found.

---

#### `POST /api/products`
Inserts a new product into the catalog.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Request Body**:
  ```json
  {
    "amazonItemId": "B09TEST001",
    "name": "Ergonomic Mechanical Keyboard",
    "brand": "Logitech",
    "category": "Electronics/Keyboards",
    "price": 149.99,
    "currency": "USD",
    "mainImageUrl": "https://images.example.com/kb.jpg"
  }
  ```
* **Responses**:
  - `201 Created`: Returns newly created `ProductDetailDto` with `Location` header.
  - `400 Bad Request`: Missing required fields.

---

### 4.3 Duplicate Candidates API (`/api/duplicate-candidates`)

#### `GET /api/duplicate-candidates`
Returns the paginated queue of detected duplicate candidate pairs.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Query Parameters**:
  - `page` (int, default: 1)
  - `pageSize` (int, default: 20)
  - `status` (int/enum, optional): `0` = Potential, `1` = Confirmed, `2` = Rejected.
  - `minScore` (decimal, optional): Filter by minimum composite similarity score (0.0 to 1.0).
  - `search` (string, optional): Filter by product title or brand.
* **Responses**:
  - `200 OK`:
    ```json
    {
      "items": [
        {
          "id": "e818ce38-662d-4ec4-9dfc-2ec647f5255a",
          "productAId": "prod-1",
          "productBId": "prod-2",
          "productA": { "name": "MX Master 3S", "brand": "Logitech" },
          "productB": { "name": "MX Master 3S Mouse", "brand": "Logitech" },
          "overallScore": 0.94,
          "textSimilarity": 0.92,
          "semanticSimilarity": 0.96,
          "attributeSimilarity": 0.95,
          "visualSimilarity": 0.91,
          "brandMatch": true,
          "modelMatch": true,
          "categoryMatch": true,
          "status": 0,
          "riskScore": 10,
          "riskLevel": "Low",
          "createdAt": "2026-08-25T14:30:00Z"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalCount": 145,
      "totalPages": 8
    }
    ```

---

#### `GET /api/duplicate-candidates/{id}`
Returns complete side-by-side comparison, 7-signal score breakdown, AI explanation, and risk assessment for a candidate pair.

* **Authorization**: `Bearer <token>`
* **Responses**:
  - `200 OK`: Returns `DuplicateCandidateDetailDto`.
  - `404 Not Found`: Candidate not found.

---

#### `POST /api/duplicate-candidates/detect`
Triggers the full batch candidate generation and 7-signal duplicate detection pipeline over the catalog.

* **Authorization**: `Bearer <token>` (**Admin Only**)
* **Responses**:
  - `200 OK`:
    ```json
    {
      "detectedCandidatesCount": 145,
      "totalPairsEvaluated": 12500,
      "executionDurationMs": 4250,
      "completedAt": "2026-09-03T12:00:00Z"
    }
    ```
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Standard user attempting admin-only detection.

---

#### `POST / PATCH /api/duplicate-candidates/{id}/confirm`
Confirms that the two products are true duplicates and records resolution.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Request Body** (optional):
  ```json
  {
    "resolutionNotes": "Confirmed matching manufacturer part number and serials."
  }
  ```
* **Responses**:
  - `200 OK`: Returns updated candidate with `status = 1` (`Confirmed`).
  - `404 Not Found`: Candidate ID not found.

---

#### `POST / PATCH /api/duplicate-candidates/{id}/reject`
Marks candidate pair as distinct non-duplicates (`status = 2`).

* **Authorization**: `Bearer <token>`
* **Request Body** (optional):
  ```json
  {
    "resolutionNotes": "Different hardware revisions (US vs EU layout)."
  }
  ```
* **Responses**:
  - `200 OK`: Returns updated candidate with `status = 2` (`Rejected`).

---

### 4.4 Search API (`/api/search`)

#### `GET /api/search` & `POST /api/search`
Performs keyword, semantic, or hybrid search across products.

* **Authorization**: `Bearer <token>`
* **Parameters / Request Body**:
  - `q` / `query` (string): User search query (e.g. `"ergonomic wireless mouse"`).
  - `mode` (int/enum): `0` = Keyword (ILIKE), `1` = Semantic (pgvector cosine), `2` = Hybrid (RRF).
  - `brand` (string, optional): Brand filter.
  - `category` (string, optional): Category filter.
  - `minScore` (double, optional): Minimum relevance score filter.
  - `page` (int, default: 1)
  - `pageSize` (int, default: 20)
* **Responses**:
  - `200 OK`:
    ```json
    {
      "query": "ergonomic wireless mouse",
      "mode": "Hybrid",
      "totalCount": 42,
      "page": 1,
      "pageSize": 20,
      "executionTimeMs": 18,
      "queryAnalysis": {
        "tokens": ["ergonomic", "wireless", "mouse"],
        "detectedBrand": null,
        "detectedCategory": "Electronics/Computers/Mice",
        "intent": "ProductSearch"
      },
      "results": [
        {
          "productId": "d04df16b-1933-4318-8f81-56ea2b8813a0",
          "name": "Logitech MX Master 3S Wireless Mouse",
          "brand": "Logitech",
          "relevanceScore": 0.985,
          "lexicalScore": 0.95,
          "semanticScore": 0.99
        }
      ]
    }
    ```

---

#### `GET /api/search/analyze`
Extracts parsed tokens, detected brand, and category from a query string.

* **Authorization**: `Bearer <token>`
* **Query Parameters**: `q` (string)
* **Responses**:
  - `200 OK`: Returns `QueryAnalysisDto`.

---

### 4.5 Analytics API (`/api/analytics`)

#### `GET /api/analytics`
Returns the aggregated platform health and KPI metrics payload.

* **Authorization**: `Bearer <token>`
* **Responses**:
  - `200 OK`:
    ```json
    {
      "catalog": {
        "totalProducts": 9220,
        "productsWithImages": 9180,
        "productsWithAttributes": 8950,
        "totalBrands": 420,
        "totalCategories": 85
      },
      "duplicates": {
        "totalCandidates": 145,
        "pendingReviewCount": 45,
        "confirmedCount": 85,
        "rejectedCount": 15,
        "duplicateRatePercent": 1.57,
        "averageOverallScore": 0.88,
        "precisionPercent": 99.31,
        "recallPercent": 100.0
      },
      "risk": {
        "totalEvaluated": 9220,
        "criticalRiskCount": 2,
        "highRiskCount": 18,
        "mediumRiskCount": 120,
        "lowRiskCount": 9080,
        "averageRiskScore": 8.4
      },
      "search": {
        "totalSearches": 1420,
        "zeroResultRatePercent": 1.2,
        "averageExecutionTimeMs": 22
      },
      "generatedAt": "2026-09-03T12:00:00Z"
    }
    ```

---

#### `GET /api/analytics/catalog-health`
Returns catalog quality and duplicate trends time-series data for dashboard visualization.

* **Authorization**: `Bearer <token>`
* **Query Parameters**: `period` (string, default: `"30d"`, supports `"7d"`, `"30d"`, `"90d"`).
* **Responses**:
  - `200 OK`:
    ```json
    {
      "period": "30D",
      "currentQualityScore": 94.2,
      "totalDuplicatesDetected": 145,
      "totalProducts": 9220,
      "dataPoints": [
        {
          "date": "2026-08-04",
          "qualityScore": 91.5,
          "duplicatesDetected": 120,
          "totalProducts": 9100
        }
      ]
    }
    ```

---

### 4.6 Settings API (`/api/settings`)

#### `GET /api/settings`
Returns active runtime similarity, risk, AI, and notification configurations.

* **Authorization**: `Bearer <token>` (`User` or `Admin`)
* **Responses**:
  - `200 OK`: Returns `SystemSettingsDto`.

---

#### `PUT /api/settings`
Updates runtime thresholds and feature toggles.

* **Authorization**: `Bearer <token>` (**Admin Only**)
* **Request Body**:
  ```json
  {
    "similarity": {
      "candidateThreshold": 0.80,
      "autoMergeThreshold": 0.95
    },
    "risk": {
      "highRiskThreshold": 60,
      "criticalRiskThreshold": 80
    },
    "ai": {
      "model": "gpt-4o-mini",
      "enableExplanations": true
    }
  }
  ```
* **Responses**:
  - `200 OK`: Returns updated `SystemSettingsDto`.
  - `400 Bad Request`: Threshold out of range (e.g. `candidateThreshold > autoMergeThreshold`).
  - `401 Unauthorized`: Unauthenticated.
  - `403 Forbidden`: Standard user attempting admin settings change.

---

#### `POST /api/settings/reset`
Restores all system settings to out-of-the-box defaults.

* **Authorization**: `Bearer <token>` (**Admin Only**)
* **Responses**:
  - `200 OK`: Returns default `SystemSettingsDto`.
  - `403 Forbidden`: Standard user attempting reset.

---

### 4.7 Health API (`/api/health`)

#### `GET /api/health`
Performs an active database connectivity probe and reports runtime status.

* **Authorization**: Anonymous
* **Responses**:
  - `200 OK`:
    ```json
    {
      "status": "Healthy",
      "service": "ProductIQ.API",
      "environment": "Development",
      "version": "1.0.0",
      "database": {
        "provider": "PostgreSQL",
        "canConnect": true,
        "status": "Connected"
      },
      "timestamp": "2026-09-03T12:00:00Z"
    }
    ```
