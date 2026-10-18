# Netlify: geschützten Wirtschaftsbund veröffentlichen

Stand: 18. Oktober 2026. Vorbereitet und lokal geprüft. Die geplante Hauptdomain ist `wirtschaftsbund.cloud`; laut Auftraggeber ist noch kein Netlify-Projekt angelegt. Registrierung, Domainverbindung und HTTPS sind noch nicht erfolgt. Bestätigte Betreiber-/Postfachangaben und verbleibende Punkte stehen im [Prüfbericht](PRUEFBERICHT.md).

## Das richtige Paket

`Der_Wirtschaftsbund_Netlify_Projekt.zip` enthält das vollständige Projekt. Entpacken: In der Projektwurzel müssen `netlify.toml`, `package.json`, `src/`, `scripts/`, `netlify/edge-functions/`, `netlify/lib/` und `dist/` liegen. `dist/` ist der fertige Veröffentlichungsordner; Netlify liefert ausschließlich dessen statische Dateien aus. Quellen, Testdaten und diese Anleitung liegen außerhalb.

**Ein Drag-and-drop-Upload von `dist/` oder einem statischen ZIP installiert die Edge Functions nicht. Er würde den vorgesehenen Passwortschutz umgehen.** Ausschließlich Git-Anbindung oder Netlify CLI aus der vollständigen Projektwurzel verwenden. Alte statische Uploadpakete und deren Hostinganleitung sind durch dieses Paket ersetzt.

## Drei Umgebungsvariablen setzen

Im Netlify-Projekt unter **Project configuration → Environment variables** anlegen. Die Werte müssen für den Scope **Functions** und den tatsächlich verwendeten Deployment-Kontext verfügbar sein; falls der Tarif keine Scope-Auswahl anbietet, die angebotene umfassende Gültigkeit nutzen. Nicht in `netlify.toml`, HTML, Git, Screenshots oder Chat eintragen. Keine Zugangsdaten als CLI-Argumente in der Shell-Historie speichern.

| Name | Inhalt |
| --- | --- |
| `ACCESS_PASSWORD` | Persönlich weitergegebenes, zufällig erzeugtes Passwort. Mindestens 20, höchstens 256 Zeichen; empfohlen mindestens 32 zufällige Bytes als Base64url-Zeichenfolge aus einem Passwortmanager. |
| `ACCESS_SESSION_SECRET` | Separater, unabhängiger zufälliger Schlüssel: mindestens 43, höchstens 256 Zeichen; empfohlen mindestens 32 zufällige Bytes als Base64url. Niemals an Besucher weitergeben. |
| `ACCESS_ALLOWED_HOSTS` | Für die geplante Hauptdomain: `wirtschaftsbund.cloud`. Ohne `https://`, Pfad oder Sternchen. Für die Prüfung vor der Domainverbindung die tatsächlich zugewiesene `*.netlify.app`-Hauptadresse zusätzlich mit Komma eintragen. Keine Adresse erraten und keinen Stern als Wert verwenden. |

Fehlt ein Wert, ist er zu kurz oder passt der aufgerufene Host nicht, antwortet der geschützte Bereich mit **503**. Es gibt kein Standardpasswort. Impressum, Datenschutz, Logo, CSS und die nötigen Webschriften bleiben öffentlich erreichbar.

Netlify übernimmt Edge-Umgebungsvariablen **beim Deployment**. Jede Änderung benötigt einen neuen Build mit Deployment. Ein bloßes Speichern im Dashboard ändert bereits veröffentlichte Edge Functions nicht.

## Weg A: Git-Anbindung

1. Vor internen Inhalten ein **privates Repository** verwenden. Das bisherige Repository `INTLYSTSOLUTION/Wirtschafsbund` ist öffentlich; Netlify schützt keine Kopien auf GitHub. Seine Sichtbarkeit und alte Git-Stände sind gesondert zu behandeln.
2. Das vollständige Projekt in die Repository-Wurzel übernehmen. In Netlify „Import an existing project“ wählen und das richtige Repository verbinden. Bestehenden Projektlink verwenden, falls bereits vorhanden.
3. Build command: `npm run build`; Publish directory: `dist`; Base directory leer, wenn `netlify.toml` in der Wurzel liegt. Node 24 wird durch die Konfiguration gesetzt. Netlify installiert anhand der Lockdatei. Falls ein übergeordnetes Repository genutzt wird, Base directory auf dessen tatsächlichen Projektunterordner setzen.
4. Die drei Variablen für **Production** setzen. Falls ein initialer Build bereits lief, nach dem Setzen erneut deployen. Ohne Werte bleibt dieser Stand geschlossen.
5. **Split Testing deaktiviert lassen.** Netlify führt bei aktivem Split Testing keine Edge Functions aus. Keine alternative statische Veröffentlichung, externen Weiterleitungsregeln oder zusätzlichen Edge Functions einrichten, die den Schutz umgehen. Automatische Branch Deploys/Deploy Previews zunächst deaktivieren oder ohne Freigabe ihrer Hosts geschlossen lassen.
6. Deploy-Log prüfen: Es müssen **`00-access` und `10-login`** paketiert sein. Nachverarbeitung muss die Rate-Limit-Regel erfolgreich übernehmen; ungültige Regeln können laut Netlify trotz erfolgreichem Deployment ignoriert werden.
7. Erst nach den folgenden Prüfungen den Zugang persönlich weitergeben.

## Weg B: Netlify CLI

Node mindestens 22.13, empfohlen 24; geprüft mit Node 24.18 und Netlify CLI 27.13.0. Die CLI ist im Projekt fest versioniert.

```sh
npm ci
npm test
npx netlify login
npx netlify link
```

`link` verbindet ein im Dashboard angelegtes Netlify-Projekt. Dort vorher oder anschließend die drei Umgebungsvariablen setzen und die tatsächlichen Adressen abgleichen. Danach aus derselben Projektwurzel:

```sh
npx netlify deploy --prod --context production
```

CLI 27 führt standardmäßig den Build aus und überträgt statische Dateien **und Edge Functions**. Nicht `--no-build` benutzen, nicht nur `--dir dist` aus einem fremden Ordner deployen. Kein separates statisches ZIP hochladen. Die gepinnten Abhängigkeiten und die vollständige `netlify/`-Struktur beibehalten.

Ein lokaler Build ohne Veröffentlichung ist möglich:

```sh
npx netlify build --offline
```

Er erzeugt neben `dist/` das Netlify-Edge-Bundle unter `.netlify/edge-functions-dist/`. Dieses generierte Verzeichnis gehört nicht ins Git oder Übergabe-ZIP; Netlify erzeugt es für jedes Deployment neu.

## Geplante Domain wirtschaftsbund.cloud verbinden

1. Das Netlify-Projekt über das vollständige GitHub-Repository anlegen. Bis zur Domainverbindung kann dessen tatsächlich zugewiesene Netlify-Hauptadresse verwendet werden; diese muss in `ACCESS_ALLOWED_HOSTS` stehen.
2. Sicherstellen, dass ihr `wirtschaftsbund.cloud` registriert habt und auf deren DNS-Verwaltung zugreifen könnt. Die Domain wurde im Rahmen dieser Arbeit weder gekauft noch als verfügbar oder bereits im Besitz geprüft.
3. In Netlify unter **Domain management → Production domains** `wirtschaftsbund.cloud` hinzufügen und als primäre Domain auswählen. Anschließend beim Domainanbieter genau die DNS-Einträge setzen, die Netlify für dieses Projekt anzeigt. Keine festen IP-Adressen aus fremden Beispielen übernehmen.
4. In Netlify DNS-Prüfung und Ausstellung des HTTPS-Zertifikats abwarten. Falls auch `www.wirtschaftsbund.cloud` verwendet werden soll, diesen Host zusätzlich in Netlify einrichten und ausdrücklich in die Hostliste aufnehmen. Ohne Einrichtung wird `www` nicht vorausgesetzt.
5. `ACCESS_ALLOWED_HOSTS` um `wirtschaftsbund.cloud` ergänzen und neu deployen. Die Netlify-Hauptadresse kann für spätere Direktaufrufe in der Liste bleiben oder nach Abschluss der Umstellung entfernt werden. Abschließend beide Adressen ohne Cookie und nach Anmeldung prüfen.

Die Domain ist keine Zugangsinformation. Passwort und Sitzungsschlüssel bleiben ausschließlich in Netlifys Umgebungsvariablen. Es wird keine produktive Canonical-URL eingebaut, solange die geplante Domain noch nicht eingerichtet ist.

## Produktionsadresse, Vorschauen und ältere Deployments

`ACCESS_ALLOWED_HOSTS` ist eine **exakte Positivliste**. Freigegebene Produktionsdomain und gegebenenfalls die Netlify-Hauptdomain eintragen. Nicht eingetragene Aliase, Branch-Hosts und Deploy-Permalinks erhalten 503; keine Wildcards verwenden. Diese Prüfung gilt auch mit einem gültigen Cookie. HTTPS ist zwingend.

Vorschauen nur bei tatsächlichem Bedarf für ihren Kontext mit **eigenem Passwort, eigenem Schlüssel und dem exakten Vorschauhost** freigeben. Keine Produktivzugangsdaten für unkontrollierte Branches verwenden. Eine neu bekannte Vorschauadresse erfordert gegebenenfalls erst das Eintragen und erneute Deployment. Sitzungscookies gelten nur für ihre jeweilige Origin; zwischen Adressen erneut anmelden.

Ältere Netlify-Deployments behalten ihre damaligen Werte und ihren damaligen Code. Eine aktuelle Host-Positivliste kann einen früheren ungeschützten Deploy nicht nachträglich schützen. Vor dem Start alle alten ungeschützten Deployments und alternativen Veröffentlichungen stilllegen beziehungsweise löschen. Freigegebene alte Vorschauen nach einem Passwortwechsel ebenfalls erneuern oder entfernen. Ein Rollback kann alte Passwörter und alten Schutzcode wiederherstellen; keinen alten Stand ungeprüft zurückrollen.

## Sitzungen, Passwortwechsel und Versuchslimit

Das Cookie `__Host-wb_session` ist HMAC-signiert, an die Origin gebunden und höchstens acht Stunden gültig. Es trägt `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/` und keine Domain. Der Inhalt enthält weder Passwort noch Namen. Antworten werden mit privaten `no-store`-Headern für Browser und Netlify-CDN ausgeliefert; beide Edge Functions laufen vor dem Cache. Bei Fehlern gilt `onError: fail`, niemals `bypass`.

Abmelden entfernt das Cookie im aktuellen Browser. Bereits kopierte gültige Cookies bleiben bis zum Ablauf oder einer Rotation technisch gültig; heruntergeladene PDFs werden nicht gelöscht. Für einen gemeinsamen Zugangsentzug Passwort oder Sitzungsschlüssel ändern und **neu deployen**. Auf dem neuen Stand sind alle bisherigen Sitzungen ungültig. Passwort und Schlüssel niemals gleichsetzen.

Netlify begrenzt `POST /anmelden` auf **8 Anfragen je 180 Sekunden pro IP-Adresse und Domain**. Das zählt auch erfolgreiche Anmeldungen; viele Personen an derselben Schul- oder Heim-IP teilen das Limit. Die plattformseitige Durchsetzung kann laut Netlify bis zu zehn Sekunden verzögert greifen. Sie ersetzt ein starkes Passwort nicht und verhindert keine verteilten Angriffe vollständig. Keine eigenen Passwort-/Request-Body-Logs einschalten. Bei 429 später erneut versuchen.

Das gemeinsame Passwort erzwingt weder genau 30–50 Personen noch erlaubt es individuellen Zugangsentzug. Wer das Passwort weitergibt, gibt Zugang weiter. Bei einem späteren Bedarf an individuellen Rechten wäre eine getrennte Kontenlösung erforderlich; sie ist hier nicht eingebaut.

## Nach dem ersten echten Deployment prüfen

- Frischer Browser ohne Cookie: Startseite, `/aufnahme.html`, `/projekte.html`, `/assets/config.js` und `/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf` müssen zum Zugang führen, ohne Inhalte im Antwortkörper. Der PDF-Link darf vor Anmeldung keine PDF liefern.
- Falsches Passwort: verständliche Meldung und kein Sitzungscookie. Richtiges Passwort: Navigation, direkte Seitenaufrufe und PDF funktionieren. Keine Passwortwerte in URL, HTML oder Logs.
- Cookie im Browser prüfen: Secure, HttpOnly, Strict; Abmelden, anschließend direkte Seiten und PDF wieder gesperrt. Nach Passwortrotation und neuem Deploy muss ein altes Cookie ebenfalls scheitern.
- Hauptdomain, Netlify-Hauptadresse, Vorschauadressen und vorhandene Deploy-Permalinks einzeln aufrufen. Nicht freigegebene Hosts müssen geschlossen bleiben.
- Antwortheader auf `no-store` prüfen. Ein Abruf aus einem zweiten Browser ohne Cookie darf keine zuvor authentifizierten Inhalte aus einem Cache erhalten.
- Rate-Limit-Regel im Deploy-Log bestätigen und mit ausschließlich falschen Testwerten in einem Wartungsfenster prüfen: nach Überschreiten des Limits einschließlich möglicher Durchsetzungsverzögerung 429 erwarten. Keine echten Passwörter in Testskripte schreiben.
- Ausfüllbare Vorlage und lokal erzeugte PDF öffnen. Mobilansicht, E-Mail-Ersatzweg und vollständige PDF-Sichtbarkeit kontrollieren. Keine Testnachricht an das echte Postfach senden.

Diese Plattform- und Kontoprüfungen sind noch offen, weil kein tatsächliches Netlify-Deployment durchgeführt wurde.

## Lokal prüfen

```sh
npm run build
npm test
npm run test:netlify
npm run test:netlify:cli
npm run test:browser
npm run test:visual
npm run test:accessibility
```

Die Browserprüfungen starten temporäre HTTPS-Server mit zufälligen, ausschließlich lokal gültigen Testwerten; OpenSSL und Playwright Chromium/WebKit sind dafür erforderlich. Der CLI-Test schreibt diese synthetischen Werte kurzzeitig in eine geschützte `.env` im temporären Testordner und löscht sie anschließend. Produktionszugangsdaten werden nicht verwendet. `test:netlify:cli` prüft die tatsächliche lokale Netlify-Edge-Laufzeit, die anderen Browserprüfungen dieselben Handler in einer lokalen HTTPS-Testumgebung. Beide ersetzen nicht das Netlify-CDN oder dessen Versuchslimit. Alle Server und temporären TLS-Schlüssel werden danach entfernt.

`npm run dev:static` ist eine ausschließlich lokale Gestaltungsvorschau ohne Schutz; nur an 127.0.0.1 gebunden. `npm run dev` startet Netlify Dev. Für eine manuelle geschützte Vorschau benötigt Netlify Dev HTTPS mit lokalem Zertifikat (`[dev.https]`, `certFile`, `keyFile`) und ausschließlich lokale Testwerte mit exakt passendem Host samt Port. Ohne diese Voraussetzungen bleibt es absichtlich geschlossen. Zertifikate und Testwerte nicht committen, keinen öffentlichen `--live`-Tunnel starten.

## Offizielle Quellen

Geprüft am 18. Oktober 2026:

- [Edge Functions: Start und Deployment](https://docs.netlify.com/build/edge-functions/get-started/)
- [Pfadzuordnung und Reihenfolge](https://docs.netlify.com/build/edge-functions/declarations/)
- [Fehlerverhalten](https://docs.netlify.com/build/edge-functions/optional-configuration/)
- [Edge-Umgebungsvariablen und erneutes Deployment](https://docs.netlify.com/build/edge-functions/environment-variables/)
- [Rate Limiting, kostenlose Regeln und Grenzen](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- [Edge-Limits einschließlich Split Testing](https://docs.netlify.com/build/edge-functions/limits/)
- [Eigene Domain zuweisen](https://docs.netlify.com/manage/domains/manage-domains/assign-a-domain-to-your-site-app/)
- [CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/) und [lokales HTTPS](https://docs.netlify.com/api-and-cli-guides/cli-guides/local-development/)

Die kostenlose Einstiegslösung benötigt keinen externen PDF-Dienst und keine Datenbank. Aktuelle Netlify-Kontingente und den tatsächlichen Tarif beim Einrichten prüfen; dauerhafte Kostenfreiheit wird nicht zugesichert.
