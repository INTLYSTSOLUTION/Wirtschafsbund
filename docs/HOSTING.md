# Statisches Hosting und Upload

Stand: 17. Oktober 2026. Das Paket ist lokal vorbereitet. Es wurde kein neuer Hostinganbieter eingerichtet und nichts live veröffentlicht.

## Vor dem öffentlichen Start

1. Tatsächliche gemeinsame Anbieterstellung, postalisch richtige und für die Anbieter geeignete gemeinsame Anschrift sowie erforderliche Mitwirkung der Sorgeberechtigten klären. Die Anschrift ist aus dem Auftrag übernommen, nicht unabhängig geprüft.
2. Die tatsächlichen Datenschutzverantwortlichen und ihre Aufgaben festlegen. Bei gemeinsamer Verantwortlichkeit insbesondere die nötige Regelung und Informationen nach Art. 26 DSGVO prüfen.
3. Hosting auswählen; dessen konkrete Verbindungsdaten, Protokollierung, Speicherdauer, Empfänger, Verträge und mögliche Drittlandübermittlungen in die Datenschutzhinweise übernehmen.
4. Tatsächliche Zugriffsrechte, Vertrags-/Kontokonfiguration und Eignung des Gmail-Postfachs prüfen. Zweck, einschlägige Rechtsgrundlage sowie Aufbewahrung und Löschung eingehender Anfragen, Anhänge und Kopien festlegen. Die vorhandenen Rechtstexte sind ein ausdrücklich gekennzeichneter Entwurf.
5. Bestätigte Inhalte in `src/data/legal.js` und `scripts/pages.mjs` einsetzen; Entwurfshinweise erst nach dieser Klärung ersetzen. `releaseConfirmed: true` kennzeichnet anschließend den bestätigten Stand. Dies ist keine automatische rechtliche Prüfung.
6. Erst nach Zuweisung einer echten öffentlichen HTTPS-Adresse `publicBaseUrl` in `src/data/site.js` setzen, einschließlich abschließendem `/`. Kein erfundener Domainname. Build, Prüfungen und ZIP erneut erzeugen.

Bis dahin enthalten die Seiten `noindex, nofollow` und `robots.txt` sperrt Crawling. Das ist **kein Zugriffsschutz**. Ein Upload auf eine öffentlich erreichbare Adresse wäre bereits eine Veröffentlichung der enthaltenen Anbieterangaben. Die lokale Vorschau ist der vorgesehene Prüfweg für diesen Entwurf.

## Passender Weg: Cloudflare Pages Direct Upload als Option

Dies ist eine technisch passende Hostingoption, kein bereits eingesetzter Anbieter. Aktuelle Tarife und Nutzungsgrenzen vor Auswahl prüfen; kostenlose Bedingungen sind nicht dauerhaft garantiert. Eine eigene kostenpflichtige Domain ist keine Funktionsvoraussetzung. Die bereitgestellte `pages.dev`-Adresse kann verwendet werden. Betreiber benötigen ein Hostingkonto; Besucher brauchen keines.

Nach gesondert entschiedener Veröffentlichung:

1. Im Cloudflare-Dashboard zu Workers & Pages gehen, eine Pages-Anwendung für Direct Upload anlegen und den Drag-and-drop-Weg wählen.
2. `Der_Wirtschaftsbund_Upload.zip` oder den **Inhalt** von `der-wirtschaftsbund-upload/` hochladen. `index.html` muss in der Wurzel liegen, daneben `assets/`, die sechs anderen HTML-Dateien, `robots.txt` und `_headers`. Nicht das Quellcode-ZIP verwenden.
3. Kein Framework, kein serverseitiger Build, keine Functions, keine Datenbank, kein Formular-Backend. Das ZIP enthält bereits fertige Dateien. Bei einer späteren Git-Anbindung wäre der Build `npm ci && npm run build`, Ausgabeverzeichnis `dist`.
4. Im Domain-Wurzelverzeichnis bereitstellen, nicht unter einem URL-Unterordner. Alle regulären Seiten und Assets nutzen relative Pfade. Die 404-Seite setzt absichtlich `<base href="/">`, damit auch verschachtelte unbekannte Adressen eine funktionierende Navigation zeigen.
5. HTTPS verwenden. `_headers` wird von Pages für statische Antworten gelesen: eigene Quellen für Skripte, CSS und Schriften; keine Formübertragung, Frames oder Objekte; kein Referrer; keine Kamera-/Mikrofon-/Standort-/Payment-Berechtigung. Bei einem anderen Hoster diese Regeln in dessen unterstützte Konfiguration übertragen. Eine Datei namens `_headers` allein aktiviert dort keine Header.
6. `404.html` auf oberster Ebene beibehalten. Keine SPA-Regel einrichten, die jede unbekannte URL auf `index.html` umleitet. Pages kann `.html`-Adressen auf ihre extensionlose Form umleiten; beide zeigen dieselbe echte Seite.
7. Nach dem autorisierten Upload Startseite, jede Unterseite direkt und nach Neuladen, eine unbekannte verschachtelte URL (HTTP 404), Header, beide PDF-Wege und Mobilansicht prüfen. Der lokale Test ersetzt diese Prüfung des tatsächlichen Hosters nicht.

Optional: Nach Klärung der Anbieterangaben und der echten Basis-URL neu bauen. Der Build erstellt dann Canonical- und OG-URLs sowie eine Sitemap der Inhaltsseiten. Ohne bestätigte Basis-URL bleiben diese Angaben weg. Ergänze gegebenenfalls einen Sitemap-Verweis bei der tatsächlichen Suchmaschinenanmeldung.

## Inhalt des Pakets

Der Upload enthält ausschließlich sieben HTML-Seiten, notwendige lokale CSS-/JS-/Bild-/Font-/PDF-Dateien, Lizenztexte und Hostingdateien. Quellvorlagen, Roh-Projektdaten, Tests, Test-PDFs, Prüfberichte, Git-Metadaten, Accounts und Zugangsdaten bleiben außerhalb.

Für ein Update immer den gesamten neuen Uploadinhalt austauschen; keine alten Kontakt- oder Unterseitenverzeichnisse aus früheren Versionen stehen lassen. Vorher eine Sicherung der vorhandenen öffentlichen Version erstellen.

## Offizielle Quellen

- [Cloudflare Pages: Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) – ZIP-/Ordner-Upload und Betreiberschritte.
- [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/) – Verarbeitung von `_headers` für statische Antworten.
- [Cloudflare Pages: Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) – HTML-Adressen und `404.html`.

Diese Dokumentation wurde für die Vorbereitung geprüft. Die abschließenden Hosting- und Datenschutzangaben hängen von der späteren tatsächlichen Auswahl ab.
