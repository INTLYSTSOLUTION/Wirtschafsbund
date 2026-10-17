# Prüfbericht und Übergabe

Stand: 17. Oktober 2026. Lokale Überarbeitung im Projekt `site/`. Keine neue Live-Veröffentlichung und keine Änderung der bisherigen gehosteten Fassung.

## Ergebnis

Die statische Website ist technisch funktionsfähig. Sie enthält sieben echte Seiten, die eigenständige Projektseite, das neue Aufnahmeformular, beide kostenlosen PDF-Wege sowie Impressum und Datenschutz als erkennbare Entwürfe. Das öffentliche Uploadpaket enthält ausschließlich auszuliefernde Dateien; Quellcode, Tests und dieser Bericht liegen separat.

Die öffentlichen Anbieter- und Datenschutzangaben sind noch nicht abschließend bestätigt. Technische Uploadfähigkeit bedeutet deshalb noch keine inhaltliche Freigabe zur Veröffentlichung.

## Tatsächlich ausgeführte Prüfungen

| Bereich | Ausführung und Ergebnis |
| --- | --- |
| Layout | Alle sieben Seiten in Chromium bei 360, 390, 768 und 1440 px: 28 Kombinationen ohne horizontalen Überlauf, fehlende Bilder, fehlgeschlagene Schriftabrufe oder JavaScript-Laufzeitfehler. Desktop- und Mobilansichten als ganze Seiten gesichtet. |
| Gestaltung | Original-Logo erhalten; Marineblau und lokale Schriften abgestimmt. Typografie, Abstände und Umbrüche aller Seitentypen überarbeitet. Formularrahmen für besseren Kontrast nachgedunkelt. |
| Bedienung | Navigation, direkte Unterseiten, Neuladen, rechtliche Footerlinks, verschachtelte unbekannte URL mit HTTP 404, Rückweg zur Startseite; Skip-Link, Tastaturfokus und mobiles Menü einschließlich Escape geprüft. |
| Textgröße | Textvergrößerung auf 200 % durch Verdoppeln der berechneten Schriftgrößen in Chromium bei 390 und 1440 px, alle sieben Seiten. Ein anfänglicher mobiler Überlauf wurde behoben; anschließend kein Seitenüberlauf. Dies ist eine Textzoom-Simulation, kein physischer Browser-Zoomtest. |
| Kontrast | Berechnete sRGB-Verhältnisse: Haupttext/Elfenbein 14,07:1; zurückhaltender Text/Elfenbein 5,40:1; zurückhaltender Text/Papier 5,99:1; Elfenbein/Marineblau 15,73:1; sekundärer Text/Marineblau 10,88:1. Eingaberahmen/Weiß 3,46:1; Umrissbutton/Elfenbein 3,51:1. Dekorative Trennlinien sind keine Bedienelemente. |
| Formular | Fünf Pflichtfelder, vier freiwillige Felder, E-Mail-/Linkfehler, Höchstlängen, kurze zulässige Antworten, sichere Textausgabe, Zusammenfassung und Bearbeiten geprüft. |
| Fehlerbehandlung | Absichtlich fehlgeschlagener PDF-Schriftabruf: Fehlermeldung, Angaben erhalten, Bearbeiten möglich und erfolgreicher erneuter Download nach Wiederherstellung. |
| Mobile Downloads | Tatsächliche PDF-Downloads in Playwright Chromium mit Pixel-7-Emulation und WebKit mit iPhone-13-Emulation. Werte danach aus den heruntergeladenen Dateien gelesen und vollständig verglichen. |
| E-Mail und Kopieren | Empfänger, kodierter Betreff und kurzer Nachrichtentext geprüft. Vollständige Antworten fehlen im mailto. Adresse und Nachricht kopiert; verweigerte Clipboard-Berechtigung löst markierbaren manuellen Ersatz aus. Kein Testversand und kein Öffnen eines echten Mailentwurfs. |
| Ohne JavaScript | Statische Navigation und natives Mobilmenü nutzbar; Formular verborgen und Felder deaktiviert; Anleitung, E-Mail und tatsächlich heruntergeladene ausfüllbare Vorlage verfügbar. Keine Formular-GET-Anfrage. |
| Datenfluss | Während des normalen Formular-/Downloadablaufs ausschließlich lokale GET-Abrufe, keine externen Anfragen oder Formübertragung, keine Cookies, kein localStorage/sessionStorage. PDF-Bibliotheken werden erst bei angefordertem Download geladen. Neuladen leert die Formulareingaben. |
| PDF-Logik | Neun automatisierte Tests bestanden: Feldschema, echte Pflicht-/Optional-Markierungen, Umlaute und Akzente, mehrzeilige Werte, lange Namen/Links und Antworten, Speichern/Wiederöffnen, passende Umbrüche, nicht unterstützte Zeichen und sichere Dateinamen. |
| PDF-Dokumente | Vorlage: drei A4-Seiten, neun editierbare AcroForm-Felder. Normalfall: drei Seiten. Extremtest: vier Seiten, zehn Felder einschließlich nummeriertem Fortsetzungsfeld. Vollständige Originalwerte erhalten. Ein unnötiger Umbruch mit verwaister Überschrift wurde bei der Sichtprüfung gefunden und korrigiert. |
| Unabhängige PDF-Prüfung | pypdf kontrolliert kanonischen Feldbaum, Seiten-Widgets, tatsächliche Werte, editierbare Flags, Feldrechtecke und nicht leere Appearance-Streams. Poppler rendert Vorlage, normale und lange Antworten sowie die ausgefüllte/wiedergeöffnete Vorlage zur Sichtprüfung. |
| Uploadpaket | ZIP entpackt: 32 öffentliche Dateien, SHA-256 aller Dateien identisch zum Uploadordner, `index.html` auf oberster Ebene. Vollständiger Chromium-/WebKit-Formulartest einschließlich Downloads und No-JavaScript direkt aus diesem entpackten Paket bestanden. Original-Logo byteidentisch. Personennamen/Anschrift nur auf den beiden rechtlichen Seiten, nicht in Metadaten. Keine Quellen, Tests oder privaten Entwürfe im Upload. |

Die Prüfung verwendet ausschließlich erfundene Personen- und Projektdaten sowie `example.org`-Adressen. Testdateien liegen außerhalb des Uploadordners. Es wurden keine Anfragen an die echte Kontaktadresse geschickt.

## Vor öffentlicher Nutzung konkret offen

- Tatsächliche Anbieterstellung der drei vom Auftraggeber genannten Personen. Keine Rechtsform wurde erfunden.
- Postalische Richtigkeit und Eignung der übernommenen gemeinsamen Anschrift. Keine zusätzlichen privaten Angaben wurden recherchiert.
- Erforderliche Mitwirkung der Sorgeberechtigten. Altersangaben und Geburtsdaten stehen nicht auf der Website.
- Tatsächliche Datenschutzverantwortung und Aufgabenverteilung; bei gemeinsamer Verantwortlichkeit die notwendige Regelung und Information.
- Tatsächlich ausgewähltes Hosting einschließlich Verbindungsdaten, etwaiger Serverprotokolle, Aufbewahrung, Empfänger, Verträge und internationaler Datenverarbeitung.
- Gmail-Kontokonfiguration und anwendbare Bedingungen; konkrete Zugriffsberechtigte, Eignung und vertragliche Einordnung; einschlägige Empfänger und Übermittlungsmechanismen. Es wird weder EU-only-Verarbeitung noch eine vorhandene Auftragsverarbeitungsvereinbarung behauptet.
- Tatsächliche Rechtsgrundlage der Anfragebearbeitung sowie umgesetzte Aufbewahrungs- und Löschregeln für Anfragen, Anhänge, Kopien, zurückgenommene/abgelehnte Anfragen und Sicherungen.
- Die echte öffentliche Basis-URL für Canonicals und Sitemap. Kein Domainname wurde erfunden. Der aktuelle Entwurf bleibt auf `noindex`.

Die Adresse `derwirtschaftsbund@gmail.com` ist nach Auftrag eingesetzt; Erreichbarkeit/Zustellung wurde nicht durch eine Testmail geprüft. Die rechtlichen Seiten sind kein abschließend rechtlich geprüfter Text.

## Grenzen der Prüfung

Kein Test auf einem physischen Android-/iOS-Gerät; mobile Browseremulation wurde tatsächlich ausgeführt. Kein manuelles Speichern in Adobe Acrobat oder Apple Vorschau, kein Screenreader-Audit, keine PDF/UA-Zertifizierung und keine vollständige WCAG-Konformitätsprüfung. Die feste PDF-Vorlage kann beim manuellen Ausfüllen keine Seiten hinzufügen; für lange Antworten den Website-Generator verwenden und jede lokal gespeicherte Datei vor Versand kontrollieren.

Kein Upload und kein Test des späteren tatsächlichen Hosters. Die Header sind für statisches Cloudflare Pages vorbereitet; bei anderem Hosting ist dessen Konfiguration anzupassen. Mailprogramm-Verfügbarkeit und automatische Attachment-Funktion wurden nicht behauptet; Anhängen und Versand erfolgen ausschließlich durch Besucher.

## Geprüfte offizielle Quellen

- [DSGVO, EUR-Lex](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679): insbesondere Art. 5, 6, 13, 15–22, 26 und 77.
- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html): allgemeine Informationspflichten; konkrete Anbieterstellung bleibt zu klären.
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html): Schutz von Informationen in Endeinrichtungen. Der Code enthält keine nicht notwendigen Cookies oder Tracking-Technologien; spätere Hosterzusätze gesondert prüfen.
- [Google-Datenschutzerklärung](https://policies.google.com/privacy?hl=de), [Nutzungsbedingungen](https://policies.google.com/terms?hl=de) und [internationale Datenübermittlungen](https://policies.google.com/privacy/frameworks?hl=de): Google Ireland als EWR-Vertragspartner, grenzüberschreitende Verarbeitung und Kontobedingungen; die konkrete Postfachkonfiguration ist nicht bekannt.
- [Hamburgischer Beauftragter für Datenschutz und Informationsfreiheit](https://datenschutz-hamburg.de/): zuständige Landesaufsicht und Beschwerdeinformationen.
- Die offiziellen Quellen zur optionalen statischen Hostingkonfiguration stehen in [HOSTING.md](HOSTING.md).

Quellenstand: 17. Oktober 2026. Aus den allgemeinen Anbieterinformationen wird keine bereits bestehende konkrete Vertrags- oder Hostingkonfiguration abgeleitet.
