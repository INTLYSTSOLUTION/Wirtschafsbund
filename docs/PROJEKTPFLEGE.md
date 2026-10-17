# Öffentliche Projekte pflegen

Zurzeit sind keine konkreten Projektdaten zur Veröffentlichung bestätigt. Die Projektseite ist trotzdem vollständig: Sie beschreibt Arbeitsfelder, Zusammenarbeit und einen möglichen Entwicklungsweg. Die Bürger-Umfrage-App wird nicht als laufendes Projekt dargestellt.

## Ein bestätigtes Projekt ergänzen

1. Namen, Kurzbeschreibung, Problem, öffentlich beschreibbaren Lösungsansatz, tatsächlichen Entwicklungsstand und öffentliche Form der Zusammenarbeit bestätigen lassen. Ein Ergebnislink ist freiwillig und muss echt und erreichbar sein.
2. Erst die **freigegebene Fassung** in `src/data/projects.js` eintragen. Die Datei ist eine JavaScript-Liste; jedes Projekt hat dieses Schema:

```js
export const publishedProjects = [
  {
    confirmed: true,
    name: 'Hier den bestätigten Projektnamen eintragen',
    description: 'Die freigegebene sachliche Kurzbeschreibung.',
    problem: 'Das tatsächlich bearbeitete Problem.',
    approach: 'Der öffentlich beschreibbare Ansatz.',
    status: 'Ausschließlich den ausdrücklich bestätigten Stand eintragen.',
    collaboration: 'Die bestätigte öffentliche Form der Zusammenarbeit.',
    // url: 'https://echte-veroeffentlichte-adresse',
  },
];
```

Das Beispiel ist nur ein Eingabeschema, kein veröffentlichbares Projekt. Platzhalter vor einem Build vollständig durch bestätigte Inhalte ersetzen. Ohne konkretes Projekt bleibt die Liste leer (`[]`). Der Build lehnt fehlende Pflichtangaben, unbestätigte Einträge und Ergebnislinks ohne HTTPS ab; die sachliche Richtigkeit kann er nicht prüfen.

3. `npm run build`, dann `npm run dev` ausführen. `projekte.html` auf Desktop und Mobilansicht kontrollieren; Links tatsächlich öffnen. Metadaten, Absatzlängen und Umbrüche mitprüfen.
4. Nach Änderungen `npm test` und die Browser-/Layoutprüfungen ausführen. `npm run package` erstellt einen frischen Uploadordner und die ZIPs. Nach autorisierter Veröffentlichung die Seite am tatsächlichen Hoster nachprüfen.

Projekte werden als großzügige Textabschnitte mit Trennlinien ausgegeben. Bei später ausreichend bestätigtem Material kann in `scripts/pages.mjs` eine eigene Seite ergänzt werden; die Links und Sitemap werden anschließend ebenfalls angepasst und getestet. Aktuell werden keine leeren Projektunterseiten erzeugt.

## Was nicht in die öffentlichen Dateien gehört

Unbestätigte Ideenlisten, interne Rollen, Finanzverteilungen, private Kontakte und unveröffentlichte Projektnotizen außerhalb von `src/assets/`, `src/data/projects.js`, `dist/` und dem Uploadordner aufbewahren. Ein ausgeblendeter Browserdatensatz wäre öffentlich abrufbar. Der Build verarbeitet freigegebene Projekttexte direkt zu HTML und kopiert die Datendatei selbst nicht in den Upload.

Eine Rücknahme erfolgt durch Entfernen des vollständigen Eintrags und einen erneuten Build. Nach einem Update sicherstellen, dass alte Projektunterseiten beim Hoster ebenfalls entfernt wurden.

Marke und E-Mail werden zentral in `src/data/site.js` gepflegt. Danach immer neu bauen, damit HTML, Browserkonfiguration und PDF-Briefkopf zusammenpassen. Rechtliche Änderungen werden separat in `src/data/legal.js` und den Rechtstexten in `scripts/pages.mjs` gepflegt.
