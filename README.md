# Der Wirtschaftsbund

Eigenständige statische Website für den Hamburger Schüler-Wirtschaftsbund. Sieben HTML-Seiten, Original-Logo, lokale Schriften und vollständig lokale PDF-Erstellung. Diese Überarbeitung wurde nicht live veröffentlicht.

Der fertige statische Stand liegt in [`dist/`](dist/); das direkt hochladbare Paket in [`downloads/Der_Wirtschaftsbund_Upload.zip`](downloads/Der_Wirtschaftsbund_Upload.zip). Vor einer öffentlichen Bereitstellung die offenen Angaben im [Prüfbericht](docs/PRUEFBERICHT.md) klären.

## Vorschau und Build

Benötigt wird Node.js mit npm; geprüft mit Node 24.18.0. Für das ZIP-Paket außerdem Python 3.

```sh
npm ci
npm run build
npm run dev
```

Vorschau: http://127.0.0.1:4173/ . Nicht über `file://` starten: JavaScript-Module benötigen einen lokalen HTTP-Server. Der Vorschau-Server verarbeitet keine Formulare und protokolliert keine Anfragen.

```sh
npm run package
```

Erzeugt neben dem Projektverzeichnis unter `../output/` den Uploadordner, dessen ZIP, das Quellcode-ZIP, die PDF und die Anleitungen. Nur `der-wirtschaftsbund-upload/` beziehungsweise dessen ZIP ist zur späteren öffentlichen Auslieferung bestimmt. Der Quellcode und die Dokumentation bleiben separat.

## Pflege

| Datei | Aufgabe |
| --- | --- |
| `src/data/site.js` | Name, ergänzende Bezeichnung, E-Mail, öffentliche Basis-URL |
| `src/data/legal.js` | Angegebene Anbieterdaten und Freigabestatus |
| `src/data/projects.js` | Ausschließlich ausdrücklich freigegebene Projektdaten |
| `scripts/pages.mjs` | Gemeinsame HTML-Vorlagen, Navigation, Seitentexte und Rechtstexte |
| `src/assets/styles.css` | Gestaltung, lokale Webschriften, responsive Layouts |
| `src/assets/fields.js` | Formularschema und Längenbegrenzungen |
| `src/assets/application.js` | Prüfen, Bearbeiten, Download und Kopierersatz |
| `src/assets/pdf.js` | Vorlage und ausgefüllte PDF mit Fortsetzungsseiten |
| `scripts/build.mjs` | Sauberer statischer Export nach `dist/` |

`dist/` wird beim Build vollständig ersetzt. Änderungen deshalb immer in den Quellen durchführen. Die ursprüngliche Sites-Konfiguration im lokalen Checkout wird nicht in das Quellcode- oder Uploadpaket übernommen; diese Aufgabe umfasst keinen Deploy.

Weitere Anleitungen: [Hosting](docs/HOSTING.md), [Projektpflege](docs/PROJEKTPFLEGE.md), [Prüfbericht und offene Angaben](docs/PRUEFBERICHT.md).

## Formular und PDF

Fünf Pflichtfelder, vier freiwillige Angaben. Die Antworten bleiben in DOM und JavaScript-Arbeitsspeicher. Es gibt keinen Formularserver, Analytics, Web Storage, Cookies oder externen PDF-Dienst. Eingaben werden in der Vorschau als Text ausgegeben. Bibliotheken und PDF-Schriften werden erst beim angeforderten Download lokal nachgeladen. Ein Neuladen kann Eingaben verlieren; kein Entwurf wird dauerhaft gespeichert.

Die leere Vorlage umfasst drei A4-Seiten mit neun echten AcroForm-Feldern. Ihre Feldflächen sind fest. Für sehr lange Antworten ist das Online-Formular vorgesehen: Es fügt Seiten hinzu und speichert die vollständige Antwort bei Bedarf in nummerierten editierbaren Fortsetzungsfeldern (`project`, `project__2` usw.). Die Schrift bleibt 10,5 pt. Nicht unterstützte Zeichen führen zu einer verständlichen Fehlermeldung, nicht zu stillen Auslassungen.

PDF-Programme können beim nachträglichen Ändern eigene Umbrüche erzeugen. Die gespeicherte Datei vor Versand erneut öffnen und auf vollständige Sichtbarkeit prüfen. Automatisches Seitenwachstum erfolgt im Website-Generator, nicht beim Ausfüllen der festen PDF-Vorlage.

Der E-Mail-Link enthält nur Empfänger, Betreff und einen kurzen Begleittext mit Namen. Besucher hängen die PDF selbst an und lösen den Versand selbst aus. Die Website behauptet weder Versand noch Eingang.

## Lokale Assets und Lizenzen

Das originale JPEG liegt unverändert in `src/assets/pferd-original.jpg`; die Darstellung maskiert lediglich ungenutzte Ränder. Marineblau `#071436` entspricht dem häufigsten Hintergrundwert des Originals. Keine Neuzeichnung oder umbenannte SVG-Datei.

Cormorant Garamond 600 und Inter 400/500 werden lokal unter SIL OFL ausgeliefert. Die statischen PDF-TTFs wurden aus den enthaltenen variablen Ausgangsfonts instanziiert. Für zuverlässige PDF-Darstellung werden die TTFs vollständig eingebettet und optionale Ligaturen deaktiviert. pdf-lib 1.17.1 und @pdf-lib/fontkit 1.1.1 werden lokal unter MIT verwendet. Lizenztexte liegen in `src/assets/licenses/` und bleiben im Upload enthalten.

## Prüfungen wiederholen

Bei laufendem `npm run dev`:

```sh
npm test
npm run test:browser
npm run test:visual
npm run test:accessibility
```

Für die Browsertests bei Bedarf einmal `npx playwright install chromium webkit` ausführen. Für die unabhängige PDF-Feldprüfung Python mit `pypdf` installieren und `python3 tests/verify_pdf.py` verwenden. Poppler (`pdftoppm`) rendert PDFs zur Sichtprüfung. Diese Werkzeuge werden ausschließlich zur Entwicklung benötigt, nicht für Websitebesucher. Ausschließlich synthetische Testdaten; kein Testversand.
