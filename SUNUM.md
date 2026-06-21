---
marp: true
theme: default
paginate: true
size: 16:9
header: 'Therapp — Duygusal Destek Topluluğu Uygulaması'
footer: 'Berkay Dursun · 2026'
---

<!-- _class: lead -->
<!-- _paginate: false -->

# 🌿 Therapp

## Duygusal Destek ve Paylaşım Topluluğu

**Mobil Uygulama + Backend API**

Berkay Dursun
2026

---

# İçindekiler

1. Proje Özeti ve Amaç
2. Çözülen Problem
3. Temel Özellikler
4. Sistem Mimarisi (Genel Bakış)
5. Teknoloji Yığını
6. Backend — Clean Architecture
7. Veri Modeli (Domain)
8. API Uç Noktaları (Endpoints)
9. Güvenlik
10. Mobil Uygulama Mimarisi
11. Ekranlar ve Navigasyon
12. Kimlik Doğrulama Akışı
13. Veritabanı
14. Kurulum ve Çalıştırma
15. Karşılaşılan Zorluklar ve Çözümler
16. Gelecek Geliştirmeler

---

# 1. Proje Özeti

**Therapp**, aynı duygusal zorlukları yaşayan insanların deneyimlerini
güvenli ve sakin bir ortamda paylaşabildiği bir **topluluk uygulamasıdır**.

- Kullanıcılar kategorilere göre (anksiyete, depresyon, yalnızlık...) gönderi paylaşır
- İsteğe bağlı **anonim** paylaşım
- Yorum, beğeni, kaydetme ve bildirim sistemi
- İçerik raporlama ve moderasyon altyapısı

> ⚠️ **Önemli:** Therapp tıbbi tavsiye/teşhis/tedavi sunmaz. İçerikler
> kullanıcı deneyimleridir; profesyonel sağlık hizmetinin yerini tutmaz.
> Uygulama bu konuda kullanıcıyı sürekli bilgilendirir (disclaimer + acil yardım).

---

# 2. Çözülen Problem

| Problem | Therapp'in Yaklaşımı |
|---|---|
| Duygularını paylaşacak güvenli alan bulamamak | Kategorilere ayrılmış, sakin bir paylaşım ortamı |
| Yargılanma korkusu | Anonim paylaşım seçeneği |
| Yalnız hissetmek | Benzer deneyimleri okuyup bağ kurma |
| Zararlı içerik riski | Raporlama, gizleme, moderasyon altyapısı |
| Yanlış tıbbi yönlendirme | Net uyarılar + acil durum kaynakları (112) |

---

# 3. Temel Özellikler

**Kullanıcı**
- Kayıt / Giriş (JWT tabanlı oturum)
- Profil yönetimi, görünen ad, biyografi

**İçerik**
- Gönderi oluşturma (kategori seçimi, anonim seçeneği)
- Akış: En Yeni / Popüler sıralama, sayfalama (infinite scroll)
- Yorum yapma ve yorumlara yanıt
- Beğeni ve kaydetme (optimistic UI)

**Topluluk & Güvenlik**
- Bildirimler (beğeni, yorum vb.)
- İçerik/kullanıcı raporlama
- 8 hazır kategori (seed)

---

# 4. Sistem Mimarisi — Genel Bakış

```
┌─────────────────────────┐         HTTPS/JSON          ┌──────────────────────────┐
│   MOBİL UYGULAMA         │  ───────────────────────▶   │   BACKEND API            │
│   React Native + Expo    │     REST + JWT Bearer       │   ASP.NET Core (.NET 8)  │
│                          │  ◀───────────────────────   │                          │
│  • expo-router           │                             │  • Controllers           │
│  • React Query (cache)   │                             │  • Application Services   │
│  • Zustand (state)       │                             │  • EF Core (ORM)         │
│  • axios (interceptors)  │                             │                          │
└─────────────────────────┘                             └────────────┬─────────────┘
                                                                      │
                                                                      ▼
                                                         ┌──────────────────────────┐
                                                         │   PostgreSQL 15          │
                                                         │   (EF Core Migrations)   │
                                                         └──────────────────────────┘
```

İki bağımsız katman: **mobil istemci** ve **backend servisi**, REST API üzerinden konuşur.

---

# 5. Teknoloji Yığını

### Backend
- **.NET 8 / ASP.NET Core Web API** (C#)
- **PostgreSQL 15** + **Entity Framework Core** (Npgsql)
- **JWT** kimlik doğrulama + **BCrypt** şifre hashleme
- **FluentValidation**, **Serilog** (loglama), **Swagger/OpenAPI**
- **AspNetCoreRateLimit** (istek sınırlama)

### Mobil
- **React Native 0.81** + **Expo SDK 54** + **TypeScript**
- **expo-router** (dosya tabanlı navigasyon)
- **TanStack React Query** (sunucu durumu/cache) + **Zustand** (istemci durumu)
- **axios** (interceptor'lar ile), **react-hook-form + zod** (formlar/validasyon)
- **expo-secure-store** (güvenli token saklama)

---

# 6. Backend — Clean Architecture

Katmanlı, bağımlılıkların içe doğru aktığı tasarım:

```
Therapp.Api            →  HTTP katmanı: Controller, Middleware, JWT setup, Swagger
   │
Therapp.Application    →  İş mantığı: Services, DTOs, Validators, Result pattern
   │                      Abstractions (arayüzler): IAppDbContext, ICurrentUser...
Therapp.Infrastructure →  Detaylar: EF Core DbContext, Migrations, BCrypt, Seed
   │
Therapp.Domain         →  Çekirdek: Entities, Enums, BaseEntity (hiçbir bağımlılık yok)
```

**Avantajları:** test edilebilirlik, bağımsız katmanlar, iş mantığının
framework'ten ayrılması, sürdürülebilirlik.

---

# 6.1 Backend — Öne Çıkan Desenler

- **Result Pattern** — Exception fırlatmak yerine `Result<T>` ile başarı/hata
  yönetimi; controller'da temiz HTTP eşlemesi (`ResultExtensions`)
- **Global Exception Middleware** — beklenmeyen hataları tek noktada yakalama
- **DTO + AutoValidation** — `FluentValidation` ile gelen istek doğrulama
- **Repository yerine `IAppDbContext`** — EF Core DbContext arayüz üzerinden soyutlanmış
- **Soft Delete & Query Filters** — silinen kayıtlar global filtre ile gizlenir
- **Seed** — uygulama açılışında 8 kategori otomatik eklenir
- **Otomatik Migration** — başlangıçta `Database.MigrateAsync()` ile şema güncellenir

---

# 7. Veri Modeli (Domain)

**Ana Varlıklar (Entities)**

| Entity | Açıklama |
|---|---|
| `User` | Kullanıcı (rol, ban durumu, disclaimer onayı) |
| `Post` | Gönderi (başlık, içerik, anonim, sayaçlar) |
| `Comment` | Yorum (yanıt desteği) |
| `Category` | Kategori (slug, ikon, renk, sıra) |
| `PostLike` / `CommentLike` | Beğeniler |
| `SavedPost` | Kaydedilen gönderiler |
| `Notification` | Bildirimler |
| `Report` | Raporlar (sebep, durum, hedef tipi) |
| `RefreshToken` | Oturum yenileme token'ları |

**Enum'lar:** `UserRole`, `NotificationType`, `ReportReason`, `ReportStatus`, `ReportTargetType`

---

# 7.1 Veri Modeli — İlişkiler

```
User ──< Post ──< Comment
 │        │  │
 │        │  └──< PostLike
 │        └─────< SavedPost
 │
 ├──< Comment ──< CommentLike
 ├──< RefreshToken
 ├──< Notification
 └──< Report

Category ──< Post
```

- Bir kullanıcının çok sayıda gönderisi/yorumu olabilir
- Her gönderi bir kategoriye aittir
- Beğeni/kaydetme için ara tablolar (many-to-many)
- Gönderi üzerindeki `LikeCount`, `CommentCount` sayaçları performans için tutulur

---

# 8. API Uç Noktaları (Endpoints)

| Alan | Örnek Endpoint'ler |
|---|---|
| **Auth** | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| **Users** | `GET /users/me`, `GET /users/{username}` |
| **Categories** | `GET /categories`, `GET /categories/{slug}` |
| **Posts** | `GET /posts` (akış), `/posts/{id}`, `POST /posts`, `/posts/{id}/like`, `/posts/{id}/save` |
| **Comments** | `GET/POST /posts/{id}/comments`, `/comments/{id}/like` |
| **Notifications** | `GET /notifications`, `/notifications/unread-count`, `/notifications/read-all` |
| **Reports** | `POST /reports` |

Tüm korumalı uç noktalar **JWT Bearer** token gerektirir.
Swagger UI ile interaktif test: `http://localhost:5080/swagger`

---

# 9. Güvenlik

- **JWT Access Token (15 dk)** + **Refresh Token (30 gün)** ile oturum
- **BCrypt** ile şifre hashleme (düz metin şifre saklanmaz)
- **Token yenileme** — access token süresi dolunca refresh ile yenilenir
- **Yetkilendirme** — `[Authorize]` ile korumalı uç noktalar
- **FluentValidation** — gelen tüm girdiler sunucuda doğrulanır
- **Rate Limiting** — kötüye kullanım/spam'e karşı istek sınırlama
- **Soft Delete + Ban** — moderasyon altyapısı
- **Mobil tarafta** token'lar `expo-secure-store` (cihaz keychain/keystore) ile saklanır
- **Sırların gizliliği** — DB şifresi vb. `.NET user secrets` ile koddan ayrı tutulur

---

# 10. Mobil Uygulama Mimarisi

**Katmanlı klasör yapısı (`src/`)**

```
api/        → Backend ile iletişim (axios client + endpoint tanımları)
hooks/      → React Query hook'ları (useFeed, useComments, useUser...)
store/      → Zustand global durum (authStore, uiStore)
components/  → Tekrar kullanılabilir UI (PostCard, Button, Input...)
theme/      → Renk, tipografi, boşluk, köşe yarıçapı sistemleri
types/      → TypeScript tip tanımları
utils/      → Yardımcılar (secureStorage, getApiUrl, formatDate...)
constants/  → Sabitler (disclaimer, acil durum kaynakları)
```

- **Sunucu durumu** React Query'de (cache, otomatik yenileme, sayfalama)
- **İstemci durumu** Zustand'da (oturum, onboarding)
- Net **sorumluluk ayrımı** ve **tip güvenliği**

---

# 11. Ekranlar ve Navigasyon

**expo-router (dosya tabanlı)**

```
app/
├── index.tsx              → Açılış / yönlendirme
├── onboarding.tsx         → Tanıtım slaytları
├── (auth)/                → Giriş & Kayıt
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                → Ana sekmeler
│   ├── home.tsx           → Akış (feed)
│   ├── categories.tsx     → Kategoriler
│   ├── create.tsx         → Gönderi oluştur
│   ├── notifications.tsx  → Bildirimler
│   └── profile.tsx        → Profil
├── post/[id].tsx          → Gönderi detay + yorumlar
├── category/[slug].tsx    → Kategori akışı
├── report.tsx, settings.tsx
```

---

# 12. Kimlik Doğrulama Akışı

```
Açılış → Token'lar secure-store'dan okunur (hydrate)
   │
   ├── Onboarding görülmemiş?  → Onboarding ekranı
   ├── Giriş yapılmamış?       → Login ekranı
   └── Giriş yapılmış?         → Ana ekran (feed)

İstek gönderimi (axios interceptor):
   Her isteğe otomatik "Authorization: Bearer <token>" eklenir

401 (token süresi doldu) alınınca:
   → Refresh token ile yeni access token alınır (otomatik)
   → İstek şeffaf şekilde tekrar denenir
   → Refresh de başarısızsa oturum temizlenir → Login
```

Kullanıcı bu yenileme sürecini fark etmez — **kesintisiz deneyim**.

---

# 13. Veritabanı (PostgreSQL)

- **Code-First** yaklaşım: C# entity'lerinden migration ile şema üretilir
- **EF Core Migrations** ile sürümlenebilir şema değişiklikleri
- **Fluent Configurations** — her entity için ayrı yapılandırma sınıfı
  (ilişkiler, indeksler, kısıtlar, snake_case tablo isimleri)
- **Otomatik migration + seed** uygulama açılışında çalışır
- Tablolar: `users`, `posts`, `comments`, `categories`, `post_likes`,
  `comment_likes`, `saved_posts`, `notifications`, `reports`, `refresh_tokens`

```
İlk açılışta otomatik: Veritabanı oluşturulur → şema uygulanır → 8 kategori eklenir
```

---

# 14. Kurulum ve Çalıştırma

**Backend**
```bash
cd backend/src/Therapp.Api
dotnet run                     # http://localhost:5080  (Swagger: /swagger)
```
- Connection string `user secrets`'tan okunur (şifre kodda değil)
- Açılışta migration + seed otomatik uygulanır

**Mobil**
```bash
cd mobile
npm install
npx expo start                 # QR → Expo Go ile telefonda açılır
```
- API adresi `.env` (`EXPO_PUBLIC_API_URL`) üzerinden ayarlanır

---

# 15. Karşılaşılan Zorluklar ve Çözümler

| Zorluk | Çözüm |
|---|---|
| Telefon backend'e ulaşamıyor (LAN) | Kestrel'i `0.0.0.0`'a bağlama + Firewall kuralları |
| Router "client isolation" | Ağ yapılandırması / doğru LAN IP tespiti |
| Expo Go SDK uyumsuzluğu (52 vs 54) | Projeyi SDK 54'e yükseltme (React 19, RN 0.81) |
| `require cycle` (modül döngüsü) | API client'ı store'dan ayırıp **registration pattern** |
| Yeniden açılışta loading'de kalma | `AuthGate` yönlendirme mantığını düzeltme (kök ekran) |
| Gizli bilgilerin korunması | `.NET user secrets` + `.env` ile koddan ayırma |

> Gerçek dünya entegrasyon sorunları teşhis edilip sistematik çözüldü.

---

# 16. Gelecek Geliştirmeler

- 🔔 **Push bildirimleri** (Expo Notifications)
- 🖼️ **Görsel/medya** ekleme desteği
- 🔍 **Arama** ve etiketleme
- 👮 **Admin moderasyon paneli** (rapor yönetimi, ban)
- 🌙 **Karanlık tema**
- ☁️ **Bulut dağıtımı** (Docker + CI/CD)
- 🧪 **Otomatik testler** (birim + entegrasyon)
- 🌐 **Çoklu dil** desteği

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Teşekkürler 🌿

## Sorular?

**Therapp** — .NET 8 + React Native/Expo ile
uçtan uca tam yığın (full-stack) bir uygulama

Berkay Dursun · 2026
