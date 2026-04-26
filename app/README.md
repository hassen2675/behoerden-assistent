# 🇩🇪 Behörden Assistent

KI-App für Ausländer in Deutschland — Behördenbriefe übersetzen, erklären, beantworten.

## Features
- 📷 Brief fotografieren → KI übersetzt & erklärt sofort
- 🤖 Chat-Assistent → Antwortbriefe auf Deutsch schreiben
- 📝 Formulare → Bürgergeld, Kindergeld, Steuererklärung Schritt für Schritt
- ✍️ Brief schreiben → Formular ausfüllen, fertiger Brief auf Deutsch
- 🏛️ Behörden erklärt → Jobcenter, Finanzamt, Ausländerbehörde etc.
- 🌍 9 Sprachen: Arabisch, Türkisch, Ukrainisch, Russisch, Persisch, Englisch, Französisch, Spanisch, Vietnamesisch

## 🚀 Deploy in 10 Minuten

### 1. GitHub Repository
```
github.com → New repository → "behoerden-assistent"
→ Alle Dateien hochladen → Commit
```

### 2. API Key holen
```
platform.anthropic.com → API Keys → Create Key
→ Key kopieren (sk-ant-api03-...)
```

### 3. Vercel Deploy
```
vercel.com → Sign Up with GitHub
→ New Project → Repository importieren
→ Environment Variables: ANTHROPIC_API_KEY = sk-ant-api03-...
→ Deploy!
```

✅ App ist live unter: `behoerden-assistent.vercel.app`

## Projektstruktur
```
├── api/claude.js     ← Sicherer Backend-Proxy
├── src/
│   ├── App.jsx       ← Komplette App
│   └── main.jsx      ← React Entry
├── index.html
├── package.json
└── vite.config.js
```

## Kosten
| User/Monat | API | Hosting | Total |
|-----------|-----|---------|-------|
| 50–100 | $5–15 | Kostenlos | ~$5–15 |
| 500–1.000 | $30–80 | $0–20 | ~$30–100 |

## Rechtliches
- Impressum + Datenschutzerklärung vor Launch erforderlich
- AVV mit Anthropic abschließen (platform.anthropic.com → Privacy)
- KI-Hinweis ist in der App eingebaut ✅
