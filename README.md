# Rappn Campaign Tracker

Piattaforma full‑stack per gestire l'intero ciclo di vita delle campagne Rappn: creazione, distribuzione, click tracking in tempo reale e analisi avanzata tramite **Google Sheets**.

## Panoramica

- **Frontend**: Single-page app in vanilla JS + Tailwind (`public/app.js`). Include dashboard performance con Chart.js, filtri attivo/inattivo, archivio campagne e flussi di riattivazione.
- **Backend**: API Express/TypeScript (`src/services/*`) con orchestrazione tra campagne, tracciamenti e sincronizzazione Google Sheets.
- **Data Layer**: Foglio Google con tre tabelle (`Campaigns`, `Placements`, `Clicks`) che funge da database a costo zero e supporta aggiornamenti in tempo reale.

## Stack Tecnologico

| Area | Tecnologie |
| --- | --- |
| Frontend | Tailwind CSS, Chart.js 4, vanilla JS |
| Backend | Node.js, Express, TypeScript |
| Data | Google Sheets API v4 |
| Deploy | Railway (build + autodeploy da `main`) |

## Architettura

1. **Campaign Service** (`src/services/campaigns.ts`)
	- CRUD, soft delete (imposta `inactive`), toggle stato e riattivazione con nuove date.
2. **Tracking Service** (`src/services/tracking.ts`)
	- Costruzione URL con UTM + QR ID, generazione QR code brandizzato.
3. **Analytics Service** (`src/services/analytics.ts`)
	- Aggregazioni per dashboard: click totali, canali, timeline giorno/settimana/mese, per-campagna, per-ora.
4. **Google Sheets Adapter** (`src/services/googleSheets.ts`)
	- Wrapper autenticato per leggere/scrivere nelle tre schede e garantire consistenza.

### Schema Google Sheets

Foglio ufficiale Rappn: [Rappn Campaign Tracker Sheet](https://docs.google.com/spreadsheets/d/1Udw-HYVgSUXconkd30_WycN-CtlqXIVPOCeDjsWICmE/edit?usp=sharing)

| Sheet | Colonne principali | Uso |
| --- | --- | --- |
| `Campaigns` | `campaign_id`, `name`, `status`, `start_date`, `end_date`, `budget` | Sorgente verità per stato e metadati campagne |
| `Placements` | `placement_id`, `campaign_id`, `channel`, `utm_*`, `qr_id` | Inventario di tutti i touchpoint tracciati |
| `Clicks` | `click_id`, `timestamp`, `campaign_id`, `placement_id`, `channel`, `ip`, `ua`, `referrer` | Log grezzo dei click per analytics |

## Setup Locale

1. **Installazione**
	```bash
	npm install
	```
2. **Configurazione env**
	```bash
	cp .env.example .env
	# Compila: PORT, API keys, GOOGLE_SHEET_ID, GOOGLE_SERVICE_KEY
	```
3. **Avvio**
	```bash
	npm run dev   # backend + static server su http://localhost:3000
	```

## Script NPM

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Nodemon + build watch |
| `npm run build` | Compila TypeScript |
| `npm start` | Avvia server in produzione |

## Flusso Operativo Campagne

1. **Creazione** – Wizard in tre step (info generali, budgeting, targeting) genera ID `YYYY-MM_GEO-CHANNEL-TYPE-CONCEPT-LANG` e salva in Sheets.
2. **Placements & Tracking** – Ogni placement riceve link con UTM e QR code per canali offline/online.
3. **Distribuzione** – Si condividono link/QR; ogni click viene registrato via endpoint `/tracking/click` direttamente nella scheda `Clicks`.
4. **Performance Dashboard**
	- Filtri rapido: `Active`, `Inactive`, `All` (sincronizzati lato API).
	- Timeline `Daily / Weekly / Monthly` (aggregation lato backend) + grafici canale/campagna/ora.
5. **Gestione Stato**
	- Toggle `Activate/Deactivate` inline.
	- `Delete` esegue soft delete (status `inactive`).
	- Pagina `Archive` mostra tutte le campagne inattive con bottone `Reactivate` (richiede nuove date).
6. **Reactivation Flow** – Patch `/campaigns/:id/reactivate` aggiorna sheet, resetta periodo e rimette la campagna nella dashboard attiva.

## Endpoint Principali

- `GET /campaigns` – Lista campagne con stato.
- `PATCH /campaigns/:id/status` – Toggle attivo/inattivo.
- `PATCH /campaigns/:id/reactivate` – Reimposta date attive.
- `GET /analytics/overview?status=active&timeframe=weekly` – Dataset per dashboard globale.
- `GET /analytics/campaign/:id?timeframe=monthly` – Insight granulari per singola campagna.
- `POST /tracking/build-placement-link` – Genera URL + QR.

## Frontend Insights

- Stato globale gestito in `public/app.js` con render ottimizzati.
- Chart.js configurato con palette brand Rappn (`#3aaa35`, `#18a19a`).
- Componenti principali: `renderPerformance`, `renderArchive`, `renderReactivateModal`.
- Funzione `setClicksTimeframe` sincronizza UI + chiamate API.

## Deployment

- Branch `main` → Railway: build `npm run build` + `npm start`.
- Variabili d'ambiente (Railway): tutte quelle di `.env` + credenziali Service Account (JSON base64).

## Come Usarlo per le Campagne

1. **Apri dashboard**: `https://rappn-campaign-tracker-production.up.railway.app`.
2. **Crea nuova campagna** dal wizard (serve budget, geo, lingua, date).
3. **Aggiungi placements** specificando canale, formato e obiettivo; copia i link tracciati.
4. **Distribuisci** i link/QR nei canali scelti.
5. **Monitora** dal tab Performance: seleziona filtro stato + timeframe adeguato alla finestra di reporting (es. weekly per retrospettive brevi, monthly per management report).
6. **Gestisci ciclo di vita**: 
	- Metti in pausa con `Deactivate` se la creatività è sospesa.
	- Sposta in archivio con `Delete` (soft).
	- Riattiva direttamente dall'Archivio impostando nuove date.

## FAQ

- **Perché Google Sheets?** Riduce costi infra, permette audit immediato e export manuale.
- **Posso usare solo campagne attive?** Sì, il filtro `Active` limita sia UI che query backend.
- **Come aggiungo nuovi campi?** Estendi la scheda Google, aggiorna mapping in `googleSheets.ts`, poi adegua DTO lato frontend.

---

