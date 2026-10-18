# Der Wirtschaftsbund

Website für den persönlich zusammengestellten Hamburger Schüler-Wirtschaftsbund. Original-Pferdelogo, Marineblau, lokale Schriften, sieben HTML-Seiten und lokale, kostenfreie PDF-Erstellung bleiben erhalten. Zugang nur nach persönlicher Weitergabe eines gemeinsamen Passworts. Keine öffentliche Selbstregistrierung.

**Netlify-Version:** Der serverseitige Schutz besteht aus zwei Edge Functions. `dist/` allein ist keine geschützte Website. Veröffentlichung ausschließlich über Git-Anbindung oder Netlify CLI aus dem vollständigen Projekt; siehe [Netlify-Anleitung](docs/HOSTING.md). Noch kein tatsächliches Netlify-Deployment.

## Start und Prüfung

Node mindestens 22.13, empfohlen 24; für das Paket Python 3, für die Browserprüfungen OpenSSL und die Playwright-Browser.

```sh
npm ci
npm run build
npm test
npx playwright install chromium webkit
npm run test:netlify
npm run test:netlify:cli
npm run test:browser
npm run test:visual
npm run test:accessibility
npx netlify build --offline
npm run package
```

Tests verwenden zufällige temporäre Zugangsdaten und synthetische Formulardaten. Sie senden keine E-Mails. Testausgaben liegen unter `../tmp/`, nie in `dist/`. `npm run dev:static` ist eine lokale, ungeschützte Gestaltungsvorschau auf 127.0.0.1:4173. Netlify Dev benötigt für den Schutz HTTPS und lokale Testkonfiguration; Anleitung siehe Hostingdokument.

## Übergabe

`npm run package` erzeugt unter `../output/`:

- `Der_Wirtschaftsbund_Netlify_Projekt.zip`: vollständiges deploybares Projekt mit Quellen, Lockdatei, Tests, Anleitung, `netlify.toml`, Edge Functions und fertigem `dist/`.
- `der-wirtschaftsbund-netlify/`: derselbe Projektstand als Ordner; `dist/` darin ist der Veröffentlichungsordner.
- `NETLIFY_SHA256.json`: Dateiprüfsummen; `PAKETNACHWEIS.json`: Struktur- und Paketnachweis.
- `pdf/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf`: ausfüllbare Vorlage.

Keine Produktionszugangsdaten, `.env`, Git-Metadaten, Netlify-Kontodaten, Testausgaben oder `node_modules` im Paket. Der Paketgenerator ersetzt die alten statischen Upload-/Quellcodepakete dieser Übergabe. Sie dürfen nicht als Netlify-Zugangsschutz verwendet werden.

## Pflege

| Datei | Aufgabe |
| --- | --- |
| `netlify.toml` | Build, Veröffentlichungsordner, lokale Netlify-Konfiguration |
| `netlify/edge-functions/00-access.js` | Alle Pfade vor Auslieferung schützen, öffentliches Minimum, Abmeldung |
| `netlify/edge-functions/10-login.js` | Passwort prüfen, Cookie setzen, Netlify-Rate-Limit deklarieren |
| `netlify/lib/` | Signatur-/Cookie-Prüfung, Sicherheitsheader und Zugangsseite |
| `src/data/site.js` | Marke und E-Mail |
| `src/data/legal.js` | Impressumsnamen, Verantwortliche, Postfachkontakt, Dreimonatsfrist; Anschrift auf Wunsch nicht veröffentlicht |
| `src/data/projects.js` | Ausschließlich bestätigte, für den Kreis bestimmte Projektdaten |
| `scripts/pages.mjs` | HTML, Navigation, Texte und Rechtstexte |
| `src/assets/styles.css` | Bestehende Gestaltung und responsive Layouts |
| `src/assets/application.js`, `fields.js`, `pdf.js` | Lokale Vorstellung, Validierung, PDF und Kopierersatz |
| `scripts/build.mjs` | Bereinigter Export nach `dist/` |

`dist/` wird beim Build vollständig ersetzt. Quellen ändern, dann neu bauen. Keine Änderungen nur in generierten HTML-Dateien. Weitere Hinweise: [Projektpflege](docs/PROJEKTPFLEGE.md), [Prüfbericht und offene Angaben](docs/PRUEFBERICHT.md).

## Zugang und PDF

Netlify-Variablen: `ACCESS_PASSWORD`, `ACCESS_SESSION_SECRET`, `ACCESS_ALLOWED_HOSTS`. Ohne vollständige Konfiguration bleibt der Bereich geschlossen. Maximal acht Stunden gültiges signiertes, origin-gebundenes Secure-/HttpOnly-/SameSite-Strict-Cookie; Passwort- oder Schlüsselwechsel plus neues Deployment widerruft alte Sitzungen. Alle geschützten Antworten `no-store`. Keine Frontend-Zugangsdaten oder Web-Storage-Schalter.

Fünf Pflichtfelder, vier freiwillige Angaben. Antworten bleiben im Arbeitsspeicher des Browsers. Keine Formularübermittlung, Tracker oder externen PDF-Dienste. Leere Vorlage: drei A4-Seiten mit neun echten AcroForm-Feldern. Bei langen Online-Antworten erzeugt der Browser zusätzliche Seiten und editierbare Fortsetzungsfelder; 10,5-pt-Schrift bleibt erhalten. Die feste leere PDF wächst beim nachträglichen Ausfüllen in einem PDF-Programm nicht automatisch. Vor dem Versand gespeicherte PDFs wieder öffnen und vollständig prüfen.

Der E-Mail-Link bereitet nur einen kurzen Entwurf an derwirtschaftsbund@gmail.com vor. PDF selbst anhängen, Versand selbst auslösen. Keine Behauptung „versendet“; kopierbare Adresse und manuelle Kopiermöglichkeit vorhanden.

## Assets

`src/assets/pferd-original.jpg` ist byteidentisch mit dem bereitgestellten Original. Marineblau `#071436`, Cormorant Garamond 600 und Inter 400/500 bleiben erhalten. Webschriften und PDF-Schriften werden lokal ausgeliefert, PDF-TTFs vollständig eingebettet. Lokale Bibliotheken: pdf-lib 1.17.1 und @pdf-lib/fontkit 1.1.1. Lizenztexte liegen in `src/assets/licenses/`.

## Vor dem Betrieb

Bestätigt sind die gemeinsame Verantwortung aller drei benannten Personen, Paul Zwicke als Postfachkontakt und eine Dreimonatsfrist für abgeschlossene Vorstellungsanfragen mit den genannten Ausnahmen. Im Impressum stehen auf Wunsch Paul Zwicke und Maximilian Siol; Finn Hülskamp bleibt in den Datenschutzhinweisen genannt. Auf ausdrücklichen Wunsch wird keine Wohnanschrift veröffentlicht; sichtbare Entwurfshinweise sind entfernt. Eine rechtliche Ausnahme von Anbieterpflichten ist damit nicht bestätigt. Paul muss die Löschregel im Postfach umsetzen; eine automatische Gmail-Löschung ist nicht eingerichtet. Die geplante Domain `wirtschaftsbund.cloud` und Netlify sind noch einzurichten. Der Passwortschutz hebt Informationspflichten nicht automatisch auf. Öffentliche Quellcode-Repositories und alte Deployments separat absichern. Netlify schützt keine bereits veröffentlichten Kopien oder frühere Git-Stände.
