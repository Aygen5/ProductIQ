# ProductIQ Roadmap

Bu roadmap ProductIQ'nun geliştirme sırasını belirler.

Temel kural:

Her aşama tamamlanmadan gereksiz şekilde sonraki aşamaya geçilmemelidir.

Amaç çalışan, gerçek veriye dayanan bir sistem oluşturmaktır.

---

# PHASE 0 — Frontend Foundation

## Amaç

Stitch tasarımını gerçek bir React uygulamasına dönüştürmek.

## Yapılacaklar

- React kurulumu
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Ortak Layout
- Sidebar
- Header
- 9 sayfanın oluşturulması
- Sayfalar arası navigation
- Stitch tasarımının korunması

## Önemli

Bu aşamada kalıcı mock data kullanılmayacaktır.

Tasarımın çalışabilmesi için gereken statik UI değerleri gerçek backend entegrasyonundan önce yalnızca görsel placeholder olarak kabul edilir ve daha sonra gerçek API verileriyle değiştirilir.

---

# PHASE 1 — Backend Foundation

## Amaç

ASP.NET Core backend temelini oluşturmak.

## Teknolojiler

- C#
- ASP.NET Core
- Clean Architecture
- Entity Framework Core
- PostgreSQL

## Yapılacaklar

- Solution oluşturma
- API projesi
- Application projesi
- Domain projesi
- Infrastructure projesi
- Dependency Injection
- Configuration
- PostgreSQL connection
- Health check

---

# PHASE 2 — Database

## Amaç

ProductIQ database yapısını oluşturmak.

## Yapılacaklar

- Product entity
- ProductImage
- ProductAttribute
- DuplicateCandidate
- DuplicateAnalysis
- DuplicateSignal
- RiskAlert
- SearchQuery
- SearchResult
- SystemSetting
- Analytics

Entity ilişkileri belirlenecek.

EF Core migrations oluşturulacak.

PostgreSQL hazırlanacak.

pgvector extension hazırlanacaktır.

---

# PHASE 3 — ABO Data Import

## Amaç

Gerçek e-commerce ürün verisini sisteme almak.

## Yapılacaklar

- ABO datasetini edinmek
- Dataset formatını incelemek
- Gerekli alanları belirlemek
- Import pipeline oluşturmak
- JSON/JSONL verisini okumak
- Normalize etmek
- Database'e batch halinde yazmak
- Görsel bilgilerini eşleştirmek
- Veri doğrulamak

Bu aşamanın sonunda database gerçek ürünlerle dolu olmalıdır.

---

# PHASE 4 — Product API

## Amaç

Frontend'in gerçek ürün verisine erişmesini sağlamak.

## Endpointler

GET /api/products

GET /api/products/{id}

## Özellikler

- pagination
- search
- filtering
- sorting
- category filtering
- brand filtering

---

# PHASE 5 — Product Catalog Integration

Product Catalog gerçek API'ye bağlanacaktır.

Frontend:

API
↓
Products
↓
Table

şeklinde çalışacaktır.

Stitch'teki örnek ürünler artık kullanılmayacaktır.

---

# PHASE 6 — Product Detail

Product Detail gerçek Product API'sine bağlanacaktır.

Gösterilecek:

- title
- brand
- seller/domain information
- model
- attributes
- images
- category
- price varsa price
- intelligence bilgileri

---

# PHASE 7 — Embedding System

## Amaç

Semantic similarity altyapısını oluşturmak.

## Yapılacaklar

- Product text preparation
- OpenAI Embeddings entegrasyonu
- Embedding oluşturma
- PostgreSQL + pgvector
- Vector storage
- Similarity search

Embedding generation batch olarak çalışabilmelidir.

---

# PHASE 8 — Duplicate Candidate Detection

## Amaç

Duplicate olabilecek ürün çiftlerini bulmak.

İlk aday filtreleri:

- brand
- category
- model
- model number

Daha sonra semantic similarity kullanılacaktır.

Amaç gereksiz ürün çiftlerini azaltmaktır.

---

# PHASE 9 — Duplicate Scoring

Aday ürünler için:

- Brand Match
- Model Match
- Text Similarity
- Semantic Similarity
- Attribute Match
- Category Match

hesaplanacaktır.

Combined Duplicate Confidence üretilecektir.

---

# PHASE 10 — Duplicate Queue

Duplicate Queue gerçek duplicate candidate verisine bağlanacaktır.

Kullanıcı:

- adayları görebilmeli
- filtreleyebilmeli
- inceleyebilmeli
- duplicate olarak onaylayabilmeli
- duplicate değil olarak reddedebilmeli

---

# PHASE 11 — Duplicate Detail

İki ürün detaylı şekilde karşılaştırılacaktır.

Gösterilecek:

- Product A
- Product B
- overall score
- text similarity
- semantic similarity
- attribute similarity
- brand match
- model match
- image similarity
- AI explanation

---

# PHASE 12 — Image Similarity

CLIP tabanlı image embedding altyapısı eklenecektir.

Akış:

Image
↓
CLIP
↓
Embedding
↓
pgvector
↓
Visual Similarity

Bu sonuç duplicate scoring sistemine eklenecektir.

---

# PHASE 13 — AI Explanation

OpenAI LLM entegrasyonu yapılacaktır.

LLM'e:

- duplicate score
- similarity signals
- matching fields
- conflicting fields

sağlanacaktır.

LLM kullanıcıya anlaşılır bir açıklama üretecektir.

LLM nihai duplicate kararını vermeyecektir.

---

# PHASE 14 — Risk Detection

Risk sinyalleri oluşturulacaktır.

Risk score üretilecektir.

Risk Analysis frontend'i gerçek API'ye bağlanacaktır.

AI risk explanation eklenecektir.

---

# PHASE 15 — Search Playground

Backend search sistemi oluşturulacaktır.

- keyword search
- semantic search
- ranking
- relevance score
- query analysis

Search Playground gerçek sonuçlarla çalışacaktır.

---

# PHASE 16 — Analytics

Backend gerçek sistem verilerinden analytics üretecektir.

Örneğin:

- total products
- duplicate rate
- confirmed duplicates
- false positives
- precision
- recall
- search relevance
- zero-result rate
- risk alerts

Frontend Analytics ekranı API'ye bağlanacaktır.

---

# PHASE 17 — Settings

Settings backend ile bağlanacaktır.

Örneğin:

- similarity threshold
- risk threshold
- AI explanations
- notification settings

database üzerinden yönetilecektir.

---

# PHASE 18 — Testing

## Backend

- unit tests
- integration tests
- API tests

## Duplicate Detection

- precision
- recall
- false positive
- false negative

## Frontend

- component tests
- API integration tests

---

# PHASE 19 — Docker

Docker Compose ile:

- frontend
- backend
- PostgreSQL + pgvector

çalıştırılacaktır.

---

# PHASE 20 — Finalization

- README
- Architecture documentation
- API documentation
- environment configuration
- GitHub cleanup
- CI/CD
- deployment

tamamlanacaktır.

---

# Nihai Hedef

Son sistem:

Gerçek Dataset
↓
PostgreSQL
↓
ASP.NET Core
↓
Duplicate Detection
↓
AI / Embeddings
↓
Analysis
↓
React Dashboard

şeklinde çalışan gerçek bir Product Intelligence platformu olacaktır.