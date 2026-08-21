# ProductIQ — AGENTS.md

Bu dosya ProductIQ üzerinde çalışan Antigravity AI coding agent için zorunlu çalışma kurallarını tanımlar.

---

# 1. DOKÜMANTASYON ÖNCELİĞİ

Projede çalışmaya başlamadan önce aşağıdaki dosyaların tamamını oku:

PROJECT.md
ARCHITECTURE.md
ROADMAP.md
AGENTS.md
SKILLS.md

Bu dosyalar ProductIQ'nun temel proje kurallarıdır.

Bu dosyalarda açıkça belirtilmeyen büyük mimari kararları kendi başına verme.

---

# 2. TEKNOLOJİ STACK'İ DEĞİŞTİRME

ProductIQ'nun backend'i:

C#
ASP.NET Core Web API
Clean Architecture
Entity Framework Core

kullanacaktır.

Python, FastAPI, Django, Flask veya başka bir backend framework'üne geçme.

Frontend:

React
TypeScript
Vite
Tailwind CSS
React Router

kullanacaktır.

Database:

PostgreSQL
pgvector

kullanacaktır.

Bu teknolojileri kullanıcı açıkça değiştirmediği sürece değiştirme.

---

# 3. AI STACK'İ

AI tarafında:

- OpenAI Embeddings
- OpenAI LLM
- CLIP

kullanılacaktır.

Embedding semantic similarity için kullanılacaktır.

LLM açıklama üretmek için kullanılacaktır.

CLIP image similarity için kullanılacaktır.

AI sistemin tamamı değildir.

AI tek başına duplicate kararı vermemelidir.

---

# 4. FRONTEND TASARIMINI KORU

Stitch tarafından hazırlanmış mevcut ProductIQ tasarımını koru.

Kullanıcı istemeden:

- renkleri
- layout'u
- sidebar'ı
- header'ı
- kartları
- typography'yi
- spacing'i
- sayfa yapısını

değiştirme.

Yeni sayfa ekleme.

Mevcut sayfaları kaldırma.

Tasarımı kendi yorumunla yeniden tasarlama.

---

# 5. 9 SAYFA SABİTTİR

ProductIQ şu 9 ana sayfaya sahiptir:

1. Dashboard
2. Product Catalog
3. Product Detail
4. Duplicate Queue
5. Duplicate Detail
6. Risk Analysis
7. Search Playground
8. Analytics
9. Settings

Kullanıcı istemeden yeni bir ana sayfa oluşturma.

---

# 6. MOCK DATA KULLANMA

ProductIQ kalıcı mock data kullanan bir proje değildir.

Frontend'de:

const products = [...]

gibi kalıcı hard-coded business data oluşturma.

Ürünler backend API'den gelmelidir.

Duplicate sonuçları backend'den gelmelidir.

Risk sonuçları backend'den gelmelidir.

Analytics backend'den gelmelidir.

Settings backend'den gelmelidir.

---

# 7. GERÇEK VERİ

Ana dataset:

Amazon Berkeley Objects (ABO)

olacaktır.

ABO verisinin gerçek yapısını incelemeden Product entity tasarımını rastgele oluşturma.

Dataset'teki önemli bilgilerin kaybolmasına izin verme.

Gerekli normalize edilmiş alanlar oluşturulabilir.

Ancak ham verinin gerekli olduğu durumlarda korunabilmesi sağlanmalıdır.

---

# 8. FRONTEND → BACKEND

Frontend database'e doğrudan bağlanmaz.

Frontend AI servislerine doğrudan bağlanmaz.

Doğru akış:

React
↓
ASP.NET Core API
↓
Application
↓
Infrastructure
↓
Database / AI Services

---

# 9. BUSINESS LOGIC

Business logic'i React componentlerine koyma.

Örneğin duplicate confidence hesaplaması frontend'de yapılmamalıdır.

Backend'de yapılmalıdır.

Frontend yalnızca sonucu göstermelidir.

---

# 10. API ÇAĞRILARI

API çağrılarını componentlerin içine dağınık şekilde yazma.

Service katmanı kullan.

Örneğin:

productService
duplicateService
riskService
searchService
analyticsService
settingsService

---

# 11. DATABASE DEĞİŞİKLİKLERİ

Database schema değişikliklerini EF Core migration ile yap.

Database'i elle değiştirme.

Migration oluşturmadan model değişikliklerini kalıcı hale getirmeye çalışma.

---

# 12. SECRET YÖNETİMİ

Aşağıdaki bilgileri source code içine yazma:

- API keys
- database passwords
- connection strings
- OpenAI API key

Environment variables kullan.

.env dosyaları gerekiyorsa secrets içermemeli veya Git'e gönderilmemelidir.

---

# 13. KOD YAZMADAN ÖNCE

Büyük bir değişiklik yapmadan önce:

1. Mevcut dosyaları incele.
2. Mevcut mimariyi anla.
3. İlgili kodu bul.
4. En küçük gerekli değişikliği belirle.
5. Uygula.
6. Build/test çalıştır.
7. Sonucu kontrol et.

---

# 14. GEREKSİZ KOD YAZMA

Kullanılmayan abstraction oluşturma.

Kullanılmayan service oluşturma.

Kullanılmayan dependency ekleme.

Kullanılmayan component oluşturma.

Gereksiz generic yapı kurma.

Kod mümkün olduğunca açık ve anlaşılır olmalıdır.

---

# 15. MEVCUT KODU BOZMA

Yeni özellik eklerken çalışan özellikleri bozma.

Bir problemi çözmek için bütün projeyi yeniden yazma.

Sadece gerekli dosyalarda değişiklik yap.

---

# 16. AI KULLANIMI

AI kullanmak yalnızca "AI eklemek" amacıyla yapılmamalıdır.

Semantic similarity için embedding kullan.

Image similarity için CLIP kullan.

AI explanation için LLM kullan.

AI'nin verdiği sonuçları sistemin diğer sinyalleriyle birlikte değerlendir.

LLM'i duplicate detection'ın tek karar mekanizması yapma.

---

# 17. DUPLICATE DETECTION

Duplicate detection şu sinyalleri dikkate alabilir:

- Brand
- Model Number
- Model Name
- Category
- Text Similarity
- Semantic Similarity
- Attribute Similarity
- Image Similarity

Bu sinyallerin birleşiminden confidence score oluşturulmalıdır.

Tek bir sinyale güvenerek duplicate kararı verilmemelidir.

---

# 18. FRONTEND VERİ SENKRONİZASYONU

Backend'deki bir veri değiştiğinde frontend eski değeri göstermemelidir.

Örneğin duplicate score database'de değişirse ilgili frontend ekranı güncel değeri API'den almalıdır.

Aynı business verisini farklı sayfalarda ayrı ayrı hard-code etme.

---

# 19. ERROR HANDLING

API hatalarını kullanıcıya kontrolsüz exception olarak gösterme.

Backend uygun HTTP status code döndürmelidir.

Frontend kullanıcıya anlaşılır hata durumu göstermelidir.

---

# 20. LOADING STATES

API ile çalışan ekranlarda loading state düşünülmelidir.

Özellikle:

- Product Catalog
- Product Detail
- Duplicate Queue
- Duplicate Detail
- Risk Analysis
- Search Playground
- Analytics

ekranları gerçek API'ye bağlandığında loading durumuna sahip olmalıdır.

---

# 21. RESPONSIVE TASARIM

Mevcut tasarım öncelikle desktop dashboard deneyimine göre korunmalıdır.

Responsive davranış gerektiğinde tasarımın görsel bütünlüğü bozulmadan uygulanmalıdır.

---

# 22. TEST

Önemli business logic test edilmelidir.

Özellikle:

- duplicate scoring
- similarity calculations
- risk scoring
- API endpoints

test edilmelidir.

---

# 23. ÇALIŞMA DİLİ

Kullanıcıyla Türkçe konuş.

Kod:

İngilizce naming convention

kullanmalıdır.

Örneğin:

DuplicateAnalysisService

ProductRepository

GetProductByIdQuery

gibi isimler kullanılmalıdır.

---

# 24. KULLANICI ONAYI

Aşağıdaki kararları kullanıcı açıkça istemeden değiştirme:

- Backend teknolojisi
- Frontend teknolojisi
- Database
- AI yaklaşımı
- Clean Architecture
- Ana sayfa yapısı
- Dataset
- Projenin temel amacı

---

# 25. ÖNEMLİ SON KURAL

Kullanıcı "planla" dediğinde kod yazma.

Kullanıcı "uygula" dediğinde uygula.

Kullanıcı bir planı onaylamadan büyük değişiklik yapma.

Her aşamada PROJECT.md, ARCHITECTURE.md ve ROADMAP.md ile uyumlu çalış.

ProductIQ'nun amacı çalışan, gerçek veriye dayanan, AI destekli ve production-like bir e-commerce intelligence platformu oluşturmaktır.