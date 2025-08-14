# Sweets aus aller Welt - Next.js Website

## 🍭 Über das Projekt

Eine moderne Next.js Website für einen Süßigkeiten-Shop mit umfassendem Tracking und Email-Marketing-Funnel.

## ✨ Features

- **📊 Umfassendes Tracking**: Google Analytics 4, Meta Pixel, TikTok Pixel
- **🎯 Funnel-System**: Automatisches Tracking des Kundenverhaltens
- **📧 Email Marketing**: Newsletter-Anmeldung mit Rabattcode
- **🎨 Moderne UI**: Responsive Design mit Framer Motion Animationen
- **🚀 Performance**: Optimiert für schnelle Ladezeiten
- **📱 Mobile First**: Perfekt für TikTok/Instagram Traffic

## 🛠 Installation

1. **Projekt Setup**:
```bash
npm install
```

2. **Environment Variables** (.env.local):
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXX
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-mailchimp-list-id
```

3. **Development Server**:
```bash
npm run dev
```

4. **Production Build**:
```bash
npm run build
npm start
```

## 📋 Setup-Anleitung

### 1. Tracking Pixel einrichten

**Google Analytics 4:**
1. Gehe zu https://analytics.google.com
2. Erstelle eine neue Property
3. Kopiere die Measurement ID (G-XXXXXXXXXX)

**Meta Pixel:**
1. Gehe zu https://business.facebook.com
2. Events Manager → Pixel erstellen
3. Kopiere die Pixel ID

**TikTok Pixel:**
1. Gehe zu https://ads.tiktok.com
2. Events Manager → Web Events → Pixel erstellen
3. Kopiere die Pixel ID

### 2. Email Marketing Setup

**Mailchimp Integration:**
1. Gehe zu https://mailchimp.com
2. Account → Extras → API Keys
3. Erstelle Audience und kopiere List ID

**Alternative Services:**
- ConvertKit
- Klaviyo  
- EmailOctopus
- Brevo (Sendinblue)

### 3. Domain & Hosting

**Empfohlene Hosting-Optionen:**
- Vercel (kostenlos für kleine Projekte)
- Netlify
- Railway
- Heroku

## 🎯 Funnel-Strategie

### 1. Traffic-Quellen
- **TikTok**: Kurze Videos mit Produkten
- **Instagram**: Stories & Reels
- **Facebook**: Targeted Ads

### 2. Landing Page Optimierung
- Starker Hero-Bereich mit Social Proof
- Produktgalerie mit Bewertungen
- Newsletter-Popup mit 15% Rabatt

### 3. Email-Sequenz (nach Anmeldung)
1. **Willkommens-Email**: 15% Rabattcode
2. **Tag 3**: Produktempfehlungen
3. **Tag 7**: Kundenbewertungen
4. **Tag 14**: Limitiertes Angebot

### 4. Retargeting
- Website-Besucher ohne Kauf
- Newsletter-Abonnenten ohne Kauf
- Abandoned Cart Recovery

## 📊 Tracking Events

Die Website trackt automatisch:
- **Seitenaufrufe**: Alle Seiten
- **Produktinteresse**: Wishlist, Produktklicks
- **Email-Anmeldung**: Newsletter Signup
- **Käufe**: Add to Cart, Purchase

## 🎨 Anpassungen

### Design anpassen:
```javascript
// tailwind.config.js - Farben ändern
colors: {
  primary: {
    500: '#dein-farbcode',
  }
}
```

### Produkte hinzufügen:
```javascript
// pages/index.js - sampleProducts Array erweitern
const sampleProducts = [
  {
    id: 5,
    name: "Dein Produkt",
    description: "Beschreibung",
    price: 9.99,
    // ...
  }
];
```

### Newsletter-Service ändern:
```javascript
// pages/api/newsletter.js
// Ersetze Mailchimp Code mit deinem Service
```

## 🚀 Go-Live Checklist

- [ ] Alle API Keys eingetragen
- [ ] Tracking Pixel getestet  
- [ ] Newsletter-Integration funktional
- [ ] Domain konfiguriert
- [ ] SSL-Zertifikat aktiv
- [ ] Google Search Console eingerichtet
- [ ] Datenschutzerklärung aktualisiert
- [ ] Impressum erstellt

## 📈 Optimierung

### Performance:
- Bilder komprimieren (WebP Format)
- Lazy Loading aktiviert
- CDN für statische Assets

### SEO:
- Meta Tags optimiert
- Schema Markup hinzufügen
- Sitemap generieren

### Conversion:
- A/B Testing für CTA Buttons
- Exit-Intent Popup
- Social Proof verstärken

## 🎬 Social Media Content Ideen

### TikTok Videos:
1. "Süßigkeiten aus aller Welt probieren"
2. "Diese Snacks gibt es nur hier"
3. "Unboxing internationaler Süßigkeiten"
4. "Geschmackstest: Original vs. Deutsch"

### Instagram Posts:
1. Produktfotos mit Flaggen der Länder
2. Behind-the-Scenes beim Verpacken
3. Kundenbewertungen als Stories
4. Reels mit süßen Momenten

## 💡 Erweiterte Features

### Für später:
- **Affiliate Programm**: Influencer Marketing
- **Subscription Box**: Monatliche Lieferungen  
- **Gamification**: Punkte sammeln
- **AR Filter**: TikTok/Instagram Integration
- **Live Shopping**: Social Commerce

## 🆘 Support

Bei Fragen oder Problemen:
1. Prüfe die Browser-Konsole auf Fehler
2. Stelle sicher, dass alle API Keys korrekt sind
3. Teste im Inkognito-Modus
4. Prüfe die Network-Registerkarte für API-Aufrufe

**Wichtige Dateien:**
- `lib/tracking.js` - Alle Tracking-Funktionen
- `lib/funnel.js` - Funnel-Logic
- `components/NewsletterSignup.js` - Email-Erfassung
- `pages/api/newsletter.js` - Backend für Newsletter