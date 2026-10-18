# Abschlussprüfung: Der Wirtschaftsbund für Netlify

Stand: 18. Oktober 2026. Technisch vorbereitet und lokal geprüft. Kein tatsächliches Netlify-Projekt angelegt, keine Netlify-Veröffentlichung vorgenommen und keine Testnachricht gesendet.

## Änderungen

- Bestehende Gestaltung, Original-Pferdelogo und Marineblau erhalten. Ruhige Zugangsseite im gleichen Schrift- und Farbsystem ergänzt. Sie enthält keine Projekte, Teilnehmerdaten oder Veranstaltungsdetails.
- Texte auf einen persönlich zusammengestellten, geschlossenen Hamburger Kreis ausgerichtet. Vorstellung ausschließlich auf persönliche Einladung. Keine öffentliche Selbstregistrierung, erfundene Rechtsform, künstliche Verknappung oder erfundene Projekte/Termine.
- Zwei serverseitige Netlify Edge Functions ergänzt: vorgeschaltete Zugangskontrolle auf allen Pfaden sowie Passwortprüfung mit plattformseitiger Begrenzung der Anmeldeversuche. Ohne vollständige Konfiguration geschlossen; exakte Hostliste berücksichtigt zusätzliche Deployment-Adressen.
- Signierte origin-gebundene Sitzung, maximal acht Stunden, Secure/HttpOnly/SameSite=Strict. Abmeldung, Ablauf und Widerruf nach Passwort-/Schlüsselwechsel plus neuem Deployment. Geschützte Seiten, Skripte, PDF-Schriften und PDF-Downloads eingeschlossen. Private `no-store`-Antworten, keine Passwörter im Frontend, kein localStorage-Schalter.
- Frühere Privatanschrift aus dem aktuellen Website-Entwurf entfernt. Impressum und Datenschutz ausdrücklich als noch zu vervollständigender Entwurf. Passende Hinweise zu Netlify, Zugangscookie, lokaler PDF und Gmail.
- Vollständiges Netlify-Projektpaket ersetzt den früheren statischen Upload. `dist/` enthält ausschließlich auszuliefernde Dateien; Quellen, Tests und Übergabe bleiben außerhalb.

## Tatsächlich durchgeführte Prüfungen

| Bereich | Ergebnis und Umfang |
| --- | --- |
| Build | `npm run build` erzeugt sieben Seiten und die PDF. `netlify build --offline`, CLI 27.13.0 / Build 37.4.3: beide Edge Functions erfolgreich paketiert. Manifest enthält `/*` vor `/anmelden`, keine Post-Cache-Routen, Fehlerverhalten `fail` und die Rate-Limit-Regel 8/180 Sekunden, IP + Domain. |
| Zugangseinheiten | 12 automatisierte Prüfungen bestanden: fehlende/zu kurze Konfiguration, HTTPS und Hostliste, direkte Seiten/PDF/Skripte, minimale öffentliche Ausnahmen, falsches/richtiges Passwort, Header, Cookieattribute, Manipulation, doppelte Cookies, Ablauf, falsche Origin, Passwort-/Schlüsselrotation, übergroße/mehrdeutige Anfragen, Fremd-Origin, Abmeldung und Fehlerfall. |
| Browser-Zugang | Chromium und WebKit auf lokalem HTTPS mit den tatsächlichen Handlern: Formularanmeldung, falsches Passwort, direkter PDF-Abruf vor/nach Anmeldung, Abmeldung, fehlende Konfiguration, signierte abgelaufene Sitzung und Passwortrotation. Anmeldung/Abmeldung auch ohne JavaScript. Keine externen Ressourcen oder unbehandelten JavaScript-Fehler. |
| Tatsächliche Netlify-Laufzeit lokal | Netlify Dev mit HTTPS und beiden geladenen Edge Functions: direkter Seiten-/PDF-Zugriff ohne Cookie gesperrt, falsches/richtiges Passwort, geschützte PDF und Abmeldung bestanden. Synthetische lokale Testwerte und temporäre Zertifikate danach entfernt. |
| Navigation und Vorstellung | Chromium mit Pixel-7-Emulation und WebKit mit iPhone-13-Emulation: Unterseiten direkt/neuladen, verschachtelte 404, Tastaturmenü, fünf Pflichtfelder, vier optionale Felder, Prüfen/Bearbeiten, Downloads, wiederholter Download, sichtbare Fehlermeldung bei fehlender PDF-Schrift, Eingabeerhalt und Wiederherstellung bestanden. |
| E-Mail und Datenschutztechnik | Mailto-Empfänger und kurzer Begleittext geprüft; Hinweis auf manuelles Anhängen sichtbar. Adresse/Nachricht kopieren und blockierte Zwischenablage mit manueller Auswahl geprüft. Kein Testversand. Keine Übertragung der Vorstellungsantworten, kein localStorage/sessionStorage, nur das notwendige Sitzungscookie. Bibliotheken erst bei PDF-Bedarf. |
| PDF | 9 PDF-/Formularprüfungen bestanden. Leere Vorlage: 3 A4-Seiten, 9 echte editierbare Felder. Normaler und maximaler synthetischer Inhalt, Umlaute, lange Namen/Links und Fortsetzungsfelder vollständig. Werte nach erneutem Öffnen geprüft; kanonische AcroForm-Felder und Widgets stimmen überein, alle Appearance-Streams vorhanden. Vorlage, ausgefüllte Fassung und vierseitiger Extremfall gerendert und visuell kontrolliert. |
| Darstellung | 28 Seitenansichten bei 360, 390, 768 und 1440 Pixeln ohne horizontalen Überlauf, fehlende Bilder/Schriften oder Skriptfehler. Zugang in beiden Engines bei denselben vier Breiten. Mobil-/Desktop-Screenshots kontrolliert. Alle sieben Seiten bei 390/1440 Pixeln mit simuliertem 200-%-Text ohne Überlauf. Geprüfte Textkontraste mindestens 5,4:1, Eingabe-/Buttonränder mindestens 3,46:1. Kein vollständiges WCAG-Audit. |
| Inhaltskontrolle | Frühere Straßen- und Ortsangabe aus dem alten Stand automatisch gegen sämtliche aktuellen Projekt-/ZIP-Dateien geprüft: kein Treffer. PDF-Text und Metadaten ebenfalls geprüft. Logo in Quelle und Veröffentlichungsordner byteidentisch zum Original. |
| Übergabe | Vollprojekt-ZIP mit `netlify.toml`, Edge Functions, Hilfsmodulen, Quellen und fertigem `dist/`; ZIP-Dateien gegen SHA-256 des Übergabeordners geprüft. Keine `.env`, Schlüssel, Kontodaten, Git-Metadaten, Testausgaben oder `node_modules` im Paket. |

Testskripte liegen in `tests/`; synthetische Ergebnisse lokal unter `../tmp/v2/` und `../tmp/netlify/`. Tests werden nicht veröffentlicht. Browsergrößen sind Emulationen, keine Prüfung auf physischen Mobilgeräten. OpenSSL, Poppler und Python/pypdf dienten ausschließlich der lokalen Prüfung.

## Was vor dem Betrieb noch festzulegen ist

1. **Netlify-Konto und echte Adressen:** Projekt verknüpfen, drei Umgebungsvariablen setzen, Split Testing ausgeschaltet lassen, vollständiges Deployment durchführen. Alle aktiven Adressen und mögliche alte ungeschützte Deployments prüfen. Die Anleitung beschreibt Git und CLI; ein statischer Upload genügt nicht.
2. **Anbieter und Anschrift:** Tatsächliche Anbieterstellung der im Entwurf genannten Personen bestätigen. Ob insbesondere § 5 DDG oder § 18 MStV greift, hängt von der tatsächlichen Nutzung ab. Eine gegebenenfalls erforderliche geeignete Anschrift fehlt ausdrücklich. Begrenzter Kreis und Passwort sind keine automatische Befreiung. Keine Ersatzadresse erfunden, keine pauschale Zusage von Rechtssicherheit.
3. **Datenschutz-Verantwortung:** Tatsächliche Verantwortliche, Aufgaben und gegebenenfalls Art.-26-Regelung bestätigen; erforderliche Kontaktdaten vervollständigen. Allein eine Zugangsbeschränkung begründet keine Haushaltsausnahme.
4. **Netlify und Gmail:** Anwendbare Konten/Verträge, erforderliche Auftragsverarbeitung, internationale Übermittlungen, konkrete Protokollierung und Speicherfristen prüfen. Gmail-Zugriffsberechtigte und zweckbezogene Aufbewahrung/Löschung von E-Mails, Anhängen und Kopien festlegen; passende Grundlage für den tatsächlichen Aufnahmeprozess bestätigen. Gegebenenfalls erforderliche Mitwirkung Sorgeberechtigter klären.
5. **Öffentliche Kopien:** Das bisherige GitHub-Repository ist öffentlich. Ein Netlify-Passwort schützt keine dort lesbaren Quellen oder Dateien. Vor internen Inhalten Zugriff auf das Repository einschränken. Entfernen einer Anschrift im aktuellen Commit entfernt sie nicht rückwirkend aus Git-Historie, früheren ZIPs, Downloads oder fremden Kopien. Repository-Sichtbarkeit und Historie wurden nicht automatisch umgeschrieben.

## Grenzen der Prüfung

Noch nicht ausgeführt: echte Netlify-Veröffentlichung, Dashboard-Konfiguration, CDN-Verhalten, Live-Rate-Limit und dessen Nachverarbeitungslog, echte Domains/Deploy-Previews sowie rechtliche/organisatorische Freigaben. Das lokale Bundle enthält die Rate-Regel; deren tatsächliche Plattformdurchsetzung ist erst nach einem Deployment prüfbar. Netlify beschreibt dafür eine mögliche Verzögerung bis zu zehn Sekunden.

Ein gemeinsam geteiltes Passwort begrenzt nicht technisch auf 30–50 Personen und erlaubt keinen einzelnen Zugangsentzug. Abmelden löscht das Browsercookie, widerruft aber keine kopierte gültige Sitzung auf anderen Geräten. Passwort- oder Schlüsselrotation plus neues Deployment widerruft alle alten Sitzungen auf diesem neuen Stand. Alte Deployments behalten ihre damaligen Werte. Heruntergeladene Dateien bleiben auf den Geräten.

## Quellen für die offenen rechtlichen Punkte

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) und [§ 18 MStV](https://www.gesetze-bayern.de/Content/Document/MStV-18): Anbieterinformationen nach tatsächlicher Nutzung.
- [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679): insbesondere Art. 2, 6, 13, 26, 28 und internationale Übermittlungen.
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html): notwendiger Zugriff auf Endgeräte.
- [Netlify Privacy](https://www.netlify.com/privacy/) und [Trust Center](https://www.netlify.com/trust-center/): konkrete Hosting-/Vertragsprüfung.
- [Google-Datenschutz](https://policies.google.com/privacy?hl=de), [Nutzungsbedingungen](https://policies.google.com/terms?hl=de), [Übermittlungsmechanismen](https://policies.google.com/privacy/frameworks?hl=de).

Technische Quellen und genaue Veröffentlichungsschritte stehen in [HOSTING.md](HOSTING.md).
