# Abschlussprüfung: Der Wirtschaftsbund für Netlify

Stand: 18. Oktober 2026. Technisch vorbereitet und lokal geprüft. Kein tatsächliches Netlify-Projekt angelegt, keine Netlify-Veröffentlichung vorgenommen und keine Testnachricht gesendet.

## Änderungen

- Bestehende Gestaltung, Original-Pferdelogo und Marineblau erhalten. Ruhige Zugangsseite im gleichen Schrift- und Farbsystem ergänzt. Sie enthält keine Projekte, Teilnehmerdaten oder Veranstaltungsdetails.
- Texte auf einen persönlich zusammengestellten, geschlossenen Hamburger Kreis ausgerichtet. Vorstellung ausschließlich auf persönliche Einladung. Keine öffentliche Selbstregistrierung, erfundene Rechtsform, künstliche Verknappung oder erfundene Projekte/Termine.
- Zwei serverseitige Netlify Edge Functions ergänzt: vorgeschaltete Zugangskontrolle auf allen Pfaden sowie Passwortprüfung mit plattformseitiger Begrenzung der Anmeldeversuche. Ohne vollständige Konfiguration geschlossen; exakte Hostliste berücksichtigt zusätzliche Deployment-Adressen.
- Signierte origin-gebundene Sitzung, maximal acht Stunden, Secure/HttpOnly/SameSite=Strict. Abmeldung, Ablauf und Widerruf nach Passwort-/Schlüsselwechsel plus neuem Deployment. Geschützte Seiten, Skripte, PDF-Schriften und PDF-Downloads eingeschlossen. Private `no-store`-Antworten, keine Passwörter im Frontend, kein localStorage-Schalter.
- Frühere Privatanschrift entfernt. Die pauschalen Entwurfshinweise wurden durch konkrete Angaben ersetzt: im Impressum Paul Zwicke und Maximilian Siol; gemeinsam datenschutzverantwortlich weiterhin Paul Zwicke, Finn Hülskamp und Maximilian Siol. Postfachkontakt Paul Zwicke; abgeschlossene Vorstellungsanfragen werden nach der festgelegten Regel nach drei Monaten gelöscht, ausgenommen erforderliche Daten laufender Zusammenarbeit und gesetzliche Aufbewahrung. Auf anschließenden ausdrücklichen Wunsch wird keine Wohnanschrift angegeben; die sichtbaren Entwurfshinweise sind entfernt. Dies ist keine Bestätigung einer gesetzlichen Ausnahme.
- Vollständiges Netlify-Projektpaket ersetzt den früheren statischen Upload. `dist/` enthält ausschließlich auszuliefernde Dateien; Quellen, Tests und Übergabe bleiben außerhalb.

## Tatsächlich durchgeführte Prüfungen

Nach Ergänzung der bestätigten Angaben wurden Impressum und Datenschutz nochmals ohne Anmeldung auf Mobilgerät und Desktop geprüft: getrennte Namenslisten, Paul als Postfachkontakt, Dreimonatsfrist mit Ausnahmen, keine Wohnanschrift und keine sichtbaren Entwurfshinweise, funktionierende Links und keine Überläufe oder JavaScript-Fehler. PDF-Erzeugung und Zugangscode wurden dabei nicht verändert; die zuvor geprüfte PDF bleibt byteidentisch. Ein ungünstiger Umbruch der E-Mail-Adresse im mobilen Footer der Rechtstexte wurde korrigiert.


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

## Bestätigte Angaben und verbleibende Schritte

Vom Auftraggeber am 18. Oktober 2026 bestätigt:

- Alle drei bisher genannten Personen bleiben gemeinsam verantwortlich. Finn Hülskamp soll aus dem Impressum entfernt werden. Entsprechend sind die Namenslisten getrennt; er bleibt in der Datenschutzerklärung genannt. Die Entfernung aus dem Impressum ändert keine tatsächliche Verantwortung.
- Paul Zwicke hat Zugriff auf das gemeinsame Gmail-Postfach und ist dort Ansprechpartner.
- Abgeschlossene Vorstellungsanfragen sollen drei Monate nach Abschluss gelöscht werden. Erforderliche Daten für laufende Zusammenarbeit und gesetzliche Aufbewahrung sind ausgenommen.
- Als Domain ist `wirtschaftsbund.cloud` vorgesehen. Ein Netlify-Projekt besteht noch nicht. Eigentum/Verfügbarkeit der Domain, DNS und HTTPS wurden nicht eingerichtet oder bestätigt.

Noch konkret erforderlich:

1. **Anbieterpflichten:** Der Auftraggeber möchte wegen des geschlossenen Kreises keine Wohnanschrift veröffentlichen. Diese Darstellungsentscheidung ist umgesetzt; die gesetzliche Ausnahme ist nicht festgestellt. § 5 DDG knüpft an geschäftsmäßige, in der Regel gegen Entgelt angebotene digitale Dienste an und enthält nicht die behauptete ausdrückliche Einschränkung auf allgemein öffentliche Webseiten. Unabhängig davon verlangt § 18 Abs. 1 MStV grundsätzlich Name und Anschrift für Angebote außerhalb ausschließlich persönlicher oder familiärer Zwecke. Art. 8 DSGVO betrifft die Einwilligung von Kindern bei Diensten der Informationsgesellschaft; er enthält keine allgemeine Befreiung von Anbieterangaben. Ob der konkrete Kreis eine Ausnahme erfüllt, ist anhand der tatsächlichen Nutzung gesondert zu beurteilen. Auch die Namensdarstellung muss die tatsächliche Anbieterstellung zutreffend wiedergeben. Für eine belastbare Freigabe der adresslosen Fassung ist eine qualifizierte rechtliche Einzelfallprüfung sinnvoll; ein persönlicher Rechtsrat wird durch diese technische Umsetzung nicht ersetzt.
2. **Betriebliche Umsetzung:** Paul setzt die festgelegte Löschregel für Postfach, Anhänge und vorhandene Kopien tatsächlich um. Es gibt keine Gmail-Anbindung und keine eingerichtete automatische Löschung. Die Aufgaben der gemeinsam Verantwortlichen und eine erforderliche Art.-26-Regelung sowie gegebenenfalls die Mitwirkung Sorgeberechtigter müssen organisatorisch umgesetzt sein; eine bereits unterschriebene Vereinbarung wird nicht behauptet.
3. **Netlify-Einrichtung:** Projekt anlegen, vollständiges Repository verbinden, Passwort/Schlüssel/Hostliste setzen, die geplante Domain verbinden und HTTPS aktivieren. Danach neu deployen und die Live-Prüfung gemäß [HOSTING.md](HOSTING.md) durchführen. Netlify nennt die Auftragsverarbeitungsvereinbarung als Bestandteil seiner Nutzungsbedingungen; die tatsächlich verwendeten Konto- und Vertragsbedingungen einschließlich Gmail sind beim Einrichten zu beachten. Es wurde kein Hostingvertrag im Namen des Nutzers abgeschlossen.
4. **Öffentliche Kopien:** Das GitHub-Repository bleibt öffentlich. Netlify schützt keine Kopien in GitHub oder früheren Veröffentlichungen. Aktuelle Dateien enthalten die entfernte Anschrift nicht, ältere Git-Stände können sie weiter enthalten. Sichtbarkeit und Historie wurden nicht automatisch geändert.

## Grenzen der Prüfung

Noch nicht ausgeführt: echte Netlify-Veröffentlichung, Dashboard-Konfiguration, CDN-Verhalten, Live-Rate-Limit und dessen Nachverarbeitungslog, echte Domains/Deploy-Previews sowie rechtliche/organisatorische Freigaben. Das lokale Bundle enthält die Rate-Regel; deren tatsächliche Plattformdurchsetzung ist erst nach einem Deployment prüfbar. Netlify beschreibt dafür eine mögliche Verzögerung bis zu zehn Sekunden.

Ein gemeinsam geteiltes Passwort begrenzt nicht technisch auf 30–50 Personen und erlaubt keinen einzelnen Zugangsentzug. Abmelden löscht das Browsercookie, widerruft aber keine kopierte gültige Sitzung auf anderen Geräten. Passwort- oder Schlüsselrotation plus neues Deployment widerruft alle alten Sitzungen auf diesem neuen Stand. Alte Deployments behalten ihre damaligen Werte. Heruntergeladene Dateien bleiben auf den Geräten.

## Quellen für die offenen rechtlichen Punkte

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) und [§ 18 MStV](https://www.gesetze-bayern.de/Content/Document/MStV-18): Anbieterinformationen nach tatsächlicher Nutzung.
- [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679): insbesondere Art. 2, 6, 8, 13, 26, 28 und internationale Übermittlungen.
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html): notwendiger Zugriff auf Endgeräte.
- [Netlify Privacy](https://www.netlify.com/privacy/) und [Trust Center](https://www.netlify.com/trust-center/): konkrete Hosting-/Vertragsprüfung.
- [Google-Datenschutz](https://policies.google.com/privacy?hl=de), [Nutzungsbedingungen](https://policies.google.com/terms?hl=de), [Übermittlungsmechanismen](https://policies.google.com/privacy/frameworks?hl=de).

- [Netlify: Einbeziehung des DPA](https://www.netlify.com/gdpr-ccpa/).

Technische Quellen und genaue Veröffentlichungsschritte stehen in [HOSTING.md](HOSTING.md).
