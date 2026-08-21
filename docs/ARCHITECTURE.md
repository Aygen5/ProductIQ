# ProductIQ Architecture

## 1. Genel Mimari

ProductIQ aşağıdaki temel mimariye sahip olacaktır:

React Frontend
        ↓
ASP.NET Core Web API
        ↓
Application / Domain / Infrastructure
        ↓
PostgreSQL + pgvector

AI servisleri backend tarafından kullanılacaktır.

Frontend doğrudan AI servislerine veya database'e bağlanmayacaktır.

---

# 2. Proje Klasör Yapısı

ProductIQ/

├── frontend/
├── backend/
├── data/
├── scripts/
├── docs/
├── PROJECT.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── AGENTS.md
└── SKILLS.md

Frontend ve backend birbirinden tamamen ayrı tutulacaktır.

---

# 3. Frontend

frontend/

src/

├── components/
├── layouts/
├── pages/
├── routes/
├── services/
├── hooks/
├── types/
├── utils/
└── assets/

Frontend'de mevcut Stitch ekranları React componentlerine dönüştürülecektir.

---

# 4. Frontend Katmanları

## Pages

Her ana ekran bir page component olacaktır.

Örneğin:

DashboardPage
ProductCatalogPage
ProductDetailPage
DuplicateQueuePage
DuplicateDetailPage
RiskAnalysisPage
SearchPlaygroundPage
AnalyticsPage
SettingsPage

---

## Components

Tekrar kullanılabilecek UI parçaları component olarak tutulacaktır.

Örneğin:

KpiCard
DataTable
Badge
ProgressBar
SimilarityScore
AiExplanation
ProductCard
Sidebar
Header

---

## Services

Backend API çağrıları services altında tutulacaktır.

Örneğin:

productService
duplicateService
riskService
searchService
analyticsService
settingsService

React componentlerinin içine dağınık API çağrıları yazılmamalıdır.

---

# 5. Backend

backend/

src/

├── ProductIQ.API/
├── ProductIQ.Application/
├── ProductIQ.Domain/
└── ProductIQ.Infrastructure/

tests/

├── ProductIQ.UnitTests/
└── ProductIQ.IntegrationTests/

---

# 6. Clean Architecture

## Domain

Sistemin temel business modellerini ve kurallarını içerir.

Örneğin:

Product
ProductAttribute
DuplicateCandidate
DuplicateAnalysis
RiskAlert
SearchQuery
SystemSetting

Domain dış sistemlere bağımlı olmamalıdır.

---

# Application

Business use-case'ler burada bulunur.

Örneğin:

GetProducts
GetProductDetail
FindDuplicateCandidates
AnalyzeDuplicate
GetRiskAlerts
AnalyzeSearchQuery
GetAnalytics
UpdateSettings

Application katmanı business akışını yönetir.

---

# Infrastructure

Dış sistemlerle iletişim burada bulunur.

Örneğin:

Entity Framework Core
PostgreSQL
pgvector
OpenAI
CLIP
external dataset
file storage

---

# API

HTTP endpointleri burada bulunur.

Örneğin:

GET /api/products

GET /api/products/{id}

GET /api/duplicates

GET /api/duplicates/{id}

POST /api/duplicates/{id}/confirm

POST /api/duplicates/{id}/reject

GET /api/risk

GET /api/search

GET /api/analytics

GET /api/settings

PUT /api/settings

---

# 7. Database

PostgreSQL kullanılacaktır.

Temel entityler:

Product

ProductImage

ProductAttribute

ProductEmbedding

DuplicateCandidate

DuplicateAnalysis

DuplicateSignal

RiskAlert

SearchQuery

SearchResult

SystemSetting

AnalyticsSnapshot

Tablo ve ilişkilerin kesin yapısı implementasyon sırasında Domain gereksinimleri ve gerçek ABO verisi incelenerek oluşturulacaktır.

---

# 8. Product Entity

Product temel ürün bilgisini temsil eder.

Temel alanlar:

- Id
- ExternalId
- Title
- Description
- Brand
- Category
- ProductType
- ModelName
- ModelNumber
- Price
- Currency
- MainImageUrl
- CreatedAt
- UpdatedAt

ABO'daki gerekli alanlar kaybolmamalıdır.

Product modelinde ProductIQ'nun ihtiyaç duyduğu normalize edilmiş alanlar bulunurken orijinal veri de gerektiğinde korunabilmelidir.

---

# 9. Embedding Architecture

Semantic similarity için ürün metinlerinden embedding oluşturulacaktır.

Ürün metni:

Title
+
Description
+
Brand
+
Model
+
Relevant Attributes

şeklinde hazırlanabilir.

Bu metin embedding modeline gönderilir.

Embedding database'de pgvector alanında saklanır.

Akış:

Product
↓
Text Preparation
↓
Embedding Service
↓
Embedding Model
↓
Vector
↓
PostgreSQL / pgvector

---

# 10. Duplicate Detection Architecture

Duplicate detection birkaç aşamada çalışacaktır.

## Aşama 1 — Candidate Generation

Sistemdeki bütün ürünler birbirleriyle karşılaştırılmayacaktır.

Öncelikle duplicate olma ihtimali bulunan adaylar bulunacaktır.

Candidate generation için:

- Brand
- Category
- Model
- Model Number
- Semantic similarity

gibi sinyaller kullanılabilir.

---

## Aşama 2 — Feature Comparison

Aday ürün çifti için:

- Brand match
- Model match
- Text similarity
- Semantic similarity
- Attribute similarity
- Category match
- Image similarity

hesaplanacaktır.

---

## Aşama 3 — Combined Score

Sinyaller birleştirilerek duplicate confidence score oluşturulacaktır.

Örnek:

Text: 0.91
Semantic: 0.96
Attribute: 0.94
Image: 0.89
Brand: 1.00
Model: 1.00

↓

Combined Duplicate Confidence

---

# 11. AI'nin Rolü

AI iki temel noktada kullanılacaktır.

## Embedding AI

Semantic similarity için.

## LLM

Analiz sonucunu açıklamak için.

LLM doğrudan:

"Bu iki ürün duplicate."

kararı vermeyecektir.

Backend tarafından hesaplanan sinyaller LLM'e context olarak sağlanacaktır.

LLM bunları açıklayacaktır.

---

# 12. Image Similarity

Image similarity için CLIP tabanlı embedding yaklaşımı kullanılacaktır.

Product image:

Image
↓
CLIP
↓
Image Embedding
↓
pgvector
↓
Visual Similarity

Image similarity duplicate analizinin bir sinyalidir.

---

# 13. Risk Detection

Risk detection duplicate detection'dan ayrı bir intelligence modülüdür.

Örnek risk sinyalleri:

- unusually low price
- suspicious seller
- new seller
- missing product information
- stock anomaly
- abnormal listing information

Risk score birden fazla sinyalden oluşturulabilir.

AI risk explanation kullanıcıya neden risk oluştuğunu açıklayabilir.

---

# 14. Search Architecture

Search Playground backend search sistemine bağlanacaktır.

Akış:

User Query

↓

Query Analysis

↓

Keyword / Text Search

+

Semantic Search

↓

Ranking

↓

Ranked Products

↓

Frontend

Ranking sonuçları için:

- text relevance
- semantic similarity
- popularity
- rating

gibi sinyaller kullanılabilir.

---

# 15. Frontend-Backend Veri Akışı

Temel prensip:

Database
↓
Backend
↓
API
↓
Frontend

Frontend kendi ürün datasını üretmeyecektir.

Örneğin Product Catalog'daki ürünler:

GET /api/products

üzerinden gelecektir.

Duplicate Queue:

GET /api/duplicates

üzerinden gelecektir.

Analytics:

GET /api/analytics

üzerinden gelecektir.

---

# 16. State ve Senkronizasyon

Backend'deki veri değiştiğinde frontend güncel veriyi almalıdır.

Örneğin:

Duplicate 94% → 87%

olarak değiştiğinde ilgili ekranlar eski 94% değerini göstermemelidir.

Frontend'deki veriler backend response'larından türetilmelidir.

---

# 17. Dataset Import

ABO dataset:

Dataset
↓
Import Process
↓
Normalization
↓
Validation
↓
PostgreSQL

şeklinde aktarılacaktır.

Import işlemi uygulamanın normal API request akışından ayrı tutulacaktır.

Tek seferlik veya kontrollü batch import yapılabilmelidir.

---

# 18. Configuration

API keys ve database connection string gibi secret bilgiler source code içinde tutulmayacaktır.

Environment variables kullanılacaktır.

Örneğin:

DATABASE_CONNECTION_STRING

OPENAI_API_KEY

AI model configuration

gibi değerler environment üzerinden yönetilecektir.

---

# 19. Docker

Geliştirme ve deployment sürecinde Docker kullanılacaktır.

En azından:

Frontend
Backend
PostgreSQL

servisleri container olarak çalıştırılabilecek şekilde hazırlanmalıdır.

pgvector destekli PostgreSQL kullanılmalıdır.

---

# 20. Temel Mimari İlkesi

ProductIQ:

UI
+
API
+
Business Logic
+
Database
+
AI

katmanlarının birbirine gereksiz şekilde bağlanmadığı, sürdürülebilir ve genişletilebilir bir sistem olarak geliştirilecektir.