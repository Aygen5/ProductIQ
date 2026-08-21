# ProductIQ — SKILLS.md

Bu dosya ProductIQ geliştirilirken Antigravity'nin ihtiyaç duyacağı temel teknik çalışma alanlarını tanımlar.

---

# 1. React + TypeScript

## Amaç

Stitch tasarımını gerçek React uygulamasına dönüştürmek.

## Bilinmesi gerekenler

- React components
- TypeScript types/interfaces
- React Router
- component composition
- reusable components
- API integration
- loading/error states

## Kural

Frontend business logic'i mümkün olduğunca backend'de tutulmalıdır.

---

# 2. Tailwind CSS

## Amaç

Mevcut Stitch tasarımını korumak.

## Bilinmesi gerekenler

- responsive layout
- flex/grid
- spacing
- typography
- colors
- borders
- shadows
- gradients
- dark UI
- reusable styling

Mevcut tasarım sistemi korunmalıdır.

---

# 3. ASP.NET Core Web API

## Amaç

Frontend ile backend arasındaki API katmanını oluşturmak.

## Bilinmesi gerekenler

- Controllers veya uygun API endpoint yapısı
- dependency injection
- configuration
- middleware
- validation
- HTTP status codes
- REST API
- error handling

---

# 4. Clean Architecture

## Amaç

Business logic ile infrastructure kodunu birbirinden ayırmak.

Katmanlar:

Domain
Application
Infrastructure
API

Bağımlılık yönü dışarıdan içeri doğru olmalıdır.

Domain dış teknolojilere bağımlı olmamalıdır.

---

# 5. Entity Framework Core

## Amaç

PostgreSQL database ile çalışmak.

## Bilinmesi gerekenler

- DbContext
- Entities
- Relationships
- LINQ
- migrations
- indexing
- pagination
- querying

Database işlemleri Infrastructure katmanında yönetilmelidir.

---

# 6. PostgreSQL

## Amaç

ProductIQ'nun ana database'i.

Saklanabilecek veriler:

- products
- product images
- attributes
- duplicate analyses
- similarity scores
- risk alerts
- search analytics
- settings
- embeddings

---

# 7. pgvector

## Amaç

Embeddingleri PostgreSQL içerisinde saklamak ve vector similarity search yapmak.

Kullanım alanları:

- semantic product similarity
- duplicate candidate search
- image similarity

Vector search sonuçları duplicate detection ve search sistemlerinde kullanılabilir.

---

# 8. OpenAI Embeddings

## Amaç

Ürün metnini semantic olarak temsil etmek.

Input:

Title
Description
Brand
Model
Relevant Attributes

Output:

Embedding vector

Bu vector pgvector üzerinde saklanır.

---

# 9. OpenAI LLM

## Amaç

Analiz sonuçlarını açıklamak.

LLM'e backend tarafından hesaplanan bilgiler gönderilir.

Örneğin:

- overall confidence
- brand match
- model match
- semantic similarity
- attribute match
- image similarity

LLM bu bilgileri kullanıcıya anlaşılır bir açıklama haline getirir.

LLM doğrudan duplicate kararını vermemelidir.

---

# 10. CLIP

## Amaç

Ürün görsellerinin semantic/image similarity değerlerini oluşturmak.

Akış:

Product Image
↓
CLIP
↓
Image Embedding
↓
pgvector
↓
Visual Similarity

CLIP image similarity için kullanılır.

---

# 11. Similarity Algorithms

ProductIQ'da birden fazla similarity yöntemi kullanılabilir.

## Text Similarity

Kelime veya string seviyesinde benzerliği ölçmek.

## Semantic Similarity

Embeddingler arasındaki anlam benzerliğini ölçmek.

## Attribute Similarity

Renk, model, materyal, boyut gibi özellikleri karşılaştırmak.

## Image Similarity

Ürün görsellerini karşılaştırmak.

---

# 12. Duplicate Detection

Duplicate detection aşağıdaki aşamalardan oluşur:

Candidate Generation
↓
Signal Extraction
↓
Similarity Calculation
↓
Combined Score
↓
Review / Decision
↓
AI Explanation

---

# 13. Search

Search sistemi için:

- keyword matching
- semantic search
- vector similarity
- ranking

kullanılabilir.

Search Playground bu sistemin test ve gözlem arayüzüdür.

---

# 14. Risk Detection

Risk detection için:

- fiyat anomalileri
- satıcı sinyalleri
- ürün bilgi eksiklikleri
- stok anomalileri
- diğer listing sinyalleri

değerlendirilebilir.

Risk scoring backend'de yapılmalıdır.

---

# 15. Data Import

ABO datasetinin import edilmesi için:

- streaming/batch processing
- JSON/JSONL parsing
- data normalization
- validation
- bulk database insert

yaklaşımları kullanılmalıdır.

Import sırasında büyük datasetin tamamını gereksiz şekilde RAM'e yüklemekten kaçınılmalıdır.

---

# 16. API Integration

Frontend API integration için merkezi service yapısı kullanılmalıdır.

Örneğin:

productService
duplicateService
riskService
searchService
analyticsService
settingsService

Componentler backend URL'lerini doğrudan hard-code etmemelidir.

---

# 17. Testing

## Unit Testing

Business logic.

Özellikle:

- similarity scoring
- duplicate scoring
- risk scoring

## Integration Testing

- API
- database
- repositories
- önemli use-case'ler

---

# 18. Docker

ProductIQ'nun lokal geliştirme ortamını kolaylaştırmak için Docker kullanılacaktır.

Ana servisler:

Frontend
Backend
PostgreSQL + pgvector

Docker Compose ile birlikte çalıştırılabilir hale getirilecektir.

---

# 19. Git

Git kullanılırken:

- küçük ve anlamlı commitler
- açık commit mesajları
- çalışan kod
- secret içermeyen commitler

tercih edilmelidir.

---

# 20. Documentation

Önemli mimari kararlar dokümante edilmelidir.

Temel dokümanlar:

PROJECT.md
ARCHITECTURE.md
ROADMAP.md
AGENTS.md
SKILLS.md

Bu dosyalar proje geliştikçe gerektiğinde güncellenebilir.

Ancak kullanıcı onayı olmadan temel mimari kararları değiştirecek şekilde güncellenmemelidir.