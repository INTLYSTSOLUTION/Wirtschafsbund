# Inhalte im geschlossenen Kreis pflegen

Es liegen keine bestätigten konkreten Projekte oder Termine vor. Die Projektseite beschreibt die gemeinsame Arbeitsweise, ohne Projekte, Erfolge, Partner oder Nutzerzahlen zu erfinden. Zusammenkünfte werden allgemein als interne Abstimmung erwähnt. Kein neues Kalender- oder Registrierungssystem.

Bestätigte Projekte werden in `src/data/projects.js` gepflegt. `publishedProjects` ist historisch benannt; die Ausgabe erfolgt im geschützten Bereich. Jeder Eintrag benötigt `confirmed: true` sowie `name`, `description`, `problem`, `approach`, `status`, `collaboration`. Ein echter HTTPS-Ergebnislink in `url` ist freiwillig. Ohne bestätigte Angaben bleibt die Liste leer. Keine Platzhalter veröffentlichen.

Inhalte nur dann eintragen, wenn sie für den zugangsberechtigten Kreis bestimmt und sachlich bestätigt sind. Ein öffentliches GitHub-Repository macht trotzdem die Quellen einsehbar: vor internen Projektangaben Repository-Zugriff klären. Vertrauliche Notizen, persönliche Kontaktdaten und Finanzen bleiben außerhalb des Projekts. Die Website braucht sie nicht.

Nach Änderungen `npm run build`, passende Tests und `npm run package` ausführen. Die [Netlify-Anleitung](HOSTING.md) gilt auch für Updates: vollständiges Deployment mit beiden Edge Functions. Keine Einzeldateien über einen statischen Upload veröffentlichen. Frühere Deployments behalten alte Inhalte und ihre damaligen Zugriffseinstellungen; nötigenfalls separat entfernen.

Name und E-Mail werden in `src/data/site.js` gepflegt. Anbieterzuordnung steht in `src/data/legal.js`, Rechtstexte in `scripts/pages.mjs`. `releaseConfirmed` ist nur eine redaktionelle Markierung und schaltet den Zugang nicht frei. Keine Anschrift erfinden und Entwurfshinweise erst nach tatsächlicher Klärung entfernen. Alle Seiten bleiben `noindex`; das ist ergänzend zum serverseitigen Zugangsschutz, kein Ersatz dafür.

Passwort und Sitzungsschlüssel ausschließlich in Netlify setzen, danach neu deployen. Die Zugangskontrolle, Hostliste, `onError: fail`, Rate-Limit und `no-store`-Header bei Pflege nicht entfernen. Keine Browser-Passwortprüfung als Ersatz einbauen.
