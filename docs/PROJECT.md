# ProductIQ

## 1. Proje Nedir?

ProductIQ, e-ticaret platformlarının ürün kataloglarını analiz etmek, katalog kalitesini artırmak ve ürün verileri içerisindeki problemleri tespit etmek amacıyla geliştirilen AI destekli bir Product Intelligence platformudur.

Projenin ana problemi duplicate product detection'dır.

Ancak ProductIQ yalnızca duplicate ürünleri bulmak için tasarlanmayacaktır.

Sistem aynı zamanda:

- ürün kataloğunu inceleme,
- ürünler arasındaki benzerliği analiz etme,
- potansiyel duplicate ürünleri tespit etme,
- riskli veya şüpheli ürün ilanlarını belirleme,
- arama sonuçlarının kalitesini analiz etme,
- sistem performansını ve katalog sağlığını izleme,
- AI destekli analiz açıklamaları üretme

özelliklerine sahip olacaktır.

ProductIQ bir "AI demo" olarak değil, gerçek bir e-ticaret problemini çözmeye çalışan production-like bir yazılım projesi olarak geliştirilecektir.

---

# 2. Projenin Temel Problemi

Büyük e-ticaret platformlarında çok büyük ürün katalogları bulunur.

Aynı ürün katalog içerisinde birden fazla kez bulunabilir.

Örneğin:

Product A:

"Apple iPhone 15 Pro Max 256GB Natural Titanium"

Product B:

"iPhone 15 Pro Max 256 GB - Natural Titanium"

İki ürünün başlıkları birebir aynı değildir.

Ancak:

- marka aynı olabilir,
- model aynı olabilir,
- model numarası aynı olabilir,
- açıklamalar anlamsal olarak benzer olabilir,
- teknik özellikler aynı olabilir,
- görseller birbirine benzeyebilir.

Bu nedenle yalnızca string karşılaştırması duplicate detection için yeterli değildir.

ProductIQ bu problemi çoklu sinyaller kullanarak çözmeye çalışacaktır.

---

# 3. Duplicate Product Detection

ProductIQ'nun ana intelligence özelliğidir.

Sistem iki ürünün duplicate olup olmadığını tek bir AI kararına göre belirlemeyecektir.

Birden fazla sinyal birlikte değerlendirilecektir.

Kullanılacak temel sinyaller:

- Brand Match
- Model Number Match
- Model Name Match
- Category Match
- Text Similarity
- Semantic Similarity
- Attribute Similarity
- Image Similarity

Bu sinyallerin sonucunda bir Combined Similarity / Duplicate Confidence Score üretilecektir.

Örneğin:

Brand Match: 100%
Model Match: 100%
Text Similarity: 91%
Semantic Similarity: 96%
Attribute Match: 94%
Image Similarity: 89%

Sonuç:

Duplicate Confidence: 94%

Bu skor sistemin farklı sinyallerden oluşturduğu birleşik değerlendirmedir.

AI tek başına karar mekanizması değildir.

---

# 4. AI Kullanımı

ProductIQ'da AI iki temel amaçla kullanılacaktır.

## 4.1 Semantic Similarity

Ürün başlığı ve açıklamasının anlamını karşılaştırmak için embedding kullanılacaktır.

Örneğin:

"Apple iPhone 15 Pro Max 256GB Natural Titanium"

ve

"iPhone 15 Pro Max 256 GB - Natural Titanium"

metinsel olarak birebir aynı değildir.

Ancak semantic olarak aynı ürünü ifade etmektedir.

Bu nedenle embedding tabanlı semantic similarity kullanılacaktır.

Embeddingler PostgreSQL üzerinde pgvector kullanılarak saklanacaktır.

---

## 4.2 AI Explanation

Sistem duplicate analizini tamamladıktan sonra kullanıcıya sonucu açıklayacaktır.

Örneğin kullanıcı Duplicate Detail ekranında "View Reasoning" butonuna bastığında sistem:

- hangi alanların eşleştiğini,
- hangi similarity sinyallerinin güçlü olduğunu,
- hangi farklılıkların bulunduğunu

anlaşılır bir şekilde açıklayacaktır.

LLM'in görevi duplicate kararını tek başına vermek değildir.

LLM mevcut analiz sonuçlarını kullanıcı tarafından anlaşılabilir şekilde açıklayacaktır.

---

# 5. Image Similarity

Ürün görsellerinin benzerliğini değerlendirmek için CLIP tabanlı image embedding yaklaşımı kullanılacaktır.

Akış:

Product Image
→ Image Embedding
→ Vector Storage
→ Similarity Comparison
→ Visual Similarity Score

Image similarity duplicate detection sistemindeki sinyallerden biri olacaktır.

Tek başına duplicate kararı vermeyecektir.

---

# 6. Gerçek Veri

ProductIQ'da kalıcı mock data kullanılmayacaktır.

Projenin gerçek veri kaynağı:

Amazon Berkeley Objects (ABO)

datasetidir.

ABO gerçek bir e-ticaret ürün veri setidir.

İlk geliştirme aşamasında datasetin kontrollü bir bölümü kullanılabilir.

Ancak sistemin veri modeli ileride datasetin tamamının kullanılmasına uygun tasarlanacaktır.

Stitch tasarımında bulunan ürün isimleri, skorlar, sayılar ve görseller yalnızca tasarım oluşturmak amacıyla kullanılan örnek verilerdir.

Backend bağlandıktan sonra bu değerler frontend içerisinde hard-code olarak tutulmayacaktır.

---

# 7. Gerçek Veri İlkesi

ProductIQ'nun temel prensiplerinden biri:

Database → Backend → API → Frontend

veri akışıdır.

Örneğin database'deki ürün adı değişirse Product Catalog ekranındaki ürün adı da değişmelidir.

Duplicate confidence score değişirse:

- Dashboard
- Duplicate Queue
- Duplicate Detail
- Product Detail

gibi ilgili ekranlar yeni değeri göstermelidir.

Frontend'de backend'den bağımsız kalmış eski veriler bulunmamalıdır.

---

# 8. Frontend

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

kullanacaktır.

Frontend'in görevi:

- verileri göstermek,
- kullanıcı etkileşimlerini yönetmek,
- API çağrılarını yapmak,
- analiz sonuçlarını görselleştirmek,
- kullanıcı aksiyonlarını backend'e iletmek

olacaktır.

Business logic mümkün olduğunca backend'de bulunacaktır.

---

# 9. Backend

Backend:

- C#
- ASP.NET Core Web API
- Clean Architecture
- Entity Framework Core

kullanacaktır.

Backend:

- REST API sağlayacak,
- database işlemlerini yönetecek,
- ürün verilerini sağlayacak,
- duplicate detection işlemlerini yönetecek,
- similarity hesaplamalarını yönetecek,
- AI servisleriyle iletişim kuracak,
- risk analizlerini yönetecek,
- analytics verilerini sağlayacak,
- sistem ayarlarını yönetecektir.

---

# 10. Database

Database:

PostgreSQL

kullanacaktır.

Semantic ve image embeddingleri için:

pgvector

kullanılacaktır.

Database ürünler, analiz sonuçları, embeddingler, duplicate adayları, risk kayıtları ve sistem ayarlarını saklayacaktır.

---

# 11. Frontend Ekranları

ProductIQ şu anda Stitch ile hazırlanmış 9 ana ekran içermektedir.

Bu ekranlar korunacaktır.

## 1. Product Intelligence Overview

Route:

/dashboard

Görevleri:

- toplam ürün sayısı
- potential duplicate sayısı
- risk alert sayısı
- search quality
- catalog health
- detection summary
- recent duplicate reviews
- recent risk alerts
- search performance

göstermek.

---

## 2. Product Catalog

Route:

/products

Görevleri:

- ürünleri listelemek
- ürün aramak
- filtrelemek
- sıralamak
- ürün detayına gitmek

---

## 3. Product Detail

Route:

/products/:id

Görevleri:

- ürün bilgilerini göstermek
- ürün görsellerini göstermek
- metadata göstermek
- listing quality göstermek
- uniqueness score göstermek
- risk durumunu göstermek
- AI analizini göstermek
- extracted attributes göstermek
- benzer ürünleri göstermek

---

## 4. Duplicate Detection Queue

Route:

/duplicates

Görevleri:

- potential duplicates
- confirmed duplicates
- under review
- AI confidence
- similarity signals
- duplicate adayları

göstermek.

---

## 5. Duplicate Analysis Detail

Route:

/duplicates/:id

Görevleri:

- Product A ve Product B karşılaştırması
- overall confidence
- text similarity
- semantic similarity
- attribute similarity
- visual similarity
- AI synopsis
- flagging criteria
- duplicate onaylama
- duplicate reddetme

---

## 6. Risk Analysis

Route:

/risk

Görevleri:

- high risk
- medium risk
- low risk
- suspicious listings
- risk score
- risk signals
- AI risk explanation
- suspend listing
- dismiss

---

## 7. Search Playground

Route:

/search

Görevleri:

- arama sorgusu çalıştırmak
- ranking ağırlıklarını görmek
- arama sonuçlarını görmek
- relevance score görmek
- semantic match görmek
- AI search explanation görmek
- JSON görünümünü görmek

---

## 8. Analytics

Route:

/analytics

Görevleri:

- catalog health
- duplicate rate
- precision
- recall
- confirmed duplicates
- false positives
- search query analytics
- average relevance score
- zero-result rate
- top search queries

---

## 9. Settings

Route:

/settings

Görevleri:

- general settings
- detection thresholds
- AI settings
- notification settings
- configuration save

---

# 12. Tasarım

Frontend dark-first bir Product Intelligence dashboard tasarımına sahiptir.

Mevcut Stitch tasarımı temel görsel referanstır.

Korunması gereken temel özellikler:

- dark background
- indigo / purple accent renkleri
- glass / layered surface görünümü
- modern dashboard yapısı
- sidebar navigation
- top header
- KPI cards
- charts
- tables
- badges
- drawers
- comparison layouts
- AI explanation panels

Stitch tasarımının gereksiz şekilde yeniden tasarlanması istenmemektedir.

---

# 13. Projenin Başarılı Sayılması

ProductIQ başarılı olduğunda:

Gerçek ürün verisi database'de bulunmalı.

Frontend bu veriyi API üzerinden göstermeli.

Duplicate detection gerçek ürünler üzerinde çalışmalı.

Semantic similarity gerçek embeddingler üzerinden hesaplanmalı.

Image similarity kullanılabilmeli.

AI analiz sonuçlarını açıklayabilmeli.

Dashboard ve Analytics gerçek sistem verilerini göstermeli.

Frontend'deki veriler backend ile senkron olmalıdır.

---

# 14. Teknoloji Özeti

## Frontend

React
TypeScript
Vite
Tailwind CSS
React Router

## Backend

C#
ASP.NET Core Web API
Clean Architecture
Entity Framework Core

## Database

PostgreSQL
pgvector

## AI

OpenAI Embeddings
OpenAI LLM
CLIP

## DevOps

Docker
Docker Compose
GitHub Actions

---

# 15. Temel Felsefe

ProductIQ'nun amacı "AI kullandım" demek değildir.

Amaç gerçek bir e-commerce problemini anlamak ve yazılım mühendisliği prensipleriyle çözmeye çalışmaktır.

AI sistemin bir parçasıdır.

Deterministic matching + similarity analysis + AI birlikte çalışır.

Bu nedenle ProductIQ bir AI wrapper değil, gerçek bir product intelligence sistemi olarak geliştirilmelidir.