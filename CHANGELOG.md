# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/)
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-09-29

### Hinzugefügt (Added)
- Zweite Beschreibungszeile unter dem Intro-Text mit aktuellen Projekten ergänzt.

## [1.0.0] - 2026-09-12

### Initiales Release der Webseite www.frankwinter.com

Erstes offizielles Hauptrelease der persönlichen Präsentationsseite als 100 % statische, sichere und hochperformante Webanwendung.

### Hinzugefügt (Added)
- **Interaktives Porträt („Clay Frank“):**
  - Responsives Porträt mit lebendigen Animationen: zufallsgesteuertes Blinzeln und Einblenden verschiedener Emotionen/Varianten (Idee, Tastatur, Lächeln, Skepsis, Facepalm, etc.).
  - Interaktion per Klick und Halten („Hold to Show“) für Desktop (Maus) und Mobile (Touch-Events inkl. `touchcancel`-Handling).
  - Intro-Hinweis: Zeigt beim ersten Laden kurz ein Schild zur Interaktionsaufforderung.
  - Automatischer Schlafmodus täglich zwischen 22:00 und 06:00 Uhr (`clay_frank_sleeping.webp`) mit Aufweck-Funktion bei Berührung (`clay_frank_sleeping_open_eyes.webp`).
- **Saisonale Themen & Feiertage:**
  - Automatische Saisonanzeige für Weihnachten (15.12.–27.12.), Neujahr (31.12.–05.01.), Halloween (25.10.–01.11.), Oktoberfest (15.09.–10.10.) und Valentinstag (14.02.).
  - Astronomisch/mathematisch exakte Berechnung des Osterzeitraums (Palmsonntag bis Ostermontag) nach dem Algorithmus von Meeus/Jones/Butcher.
  - URL-Parameter zur Vorschau und Steuerung (`?sleeping`, `?awake`, `?away`, `?xmas`, `?easter`, `?halloween`, etc.).
- **Abwesenheitsanzeige (`away.json`):**
  - GitOps-basierte Steuerung von Abwesenheitszeiträumen direkt im Repository über `www/away.json`.
- **Design & Layout:**
  - Minimalistisches Dark-Theme im responsiven Design (`min-height: 100dvh`).
  - Social-Media-Links zu GitHub, itch.io, Instagram, LinkedIn und YouTube mit animierten SVG-Icons.
- **Continuous Integration (CI) & Code Quality:**
  - Neuer GitHub Actions Workflow (`ci.yml`) bei jedem Push und Pull Request auf `main`.
  - JSON-Schema- und Datumsgültigkeitsprüfung für `away.json`.
  - Syntaxvalidierung für JavaScript (`node --check`).
  - HTML5-Linting via HTMLHint (`.htmlhintrc`).
  - CSS-Linting via Stylelint (`.stylelintrc.json`).
  - Automatisierte Bildintegritätsprüfung aller im Code referenzierten WebP-Dateien.
- **Automatisierter Release-Workflow:**
  - GitHub Actions Workflow (`release.yml`) zum automatischen Deployment auf den Webhoster (Webgo) per SSH und `rsync`.
  - Auslösung automatisch bei Veröffentlichung eines GitHub Releases (`release: published`) sowie manuell (`workflow_dispatch`).
  - Concurrency-Gruppierung zur Vermeidung paralleler Deployment-Konflikte.
- **Repository-Konfiguration:**
  - Standard `.gitignore` für Betriebssystem-Dateien (`.DS_Store`, `Thumbs.db`), Editor-Konfigurationen (`.vscode/`, `.idea/`) und temporäre Dateien.
  - `.gitattributes` mit LF-Zeilenumbruch-Normalisierung.

### Behoben (Fixed)
- Doppeltes HTML-Attribut `id="frank-portrait"` in `www/index.html` entfernt.
- CSS-Syntaxfehler (`height: 22p2x;` statt `height: 22px;`) in `www/site.css` korrigiert.

### Entfernt (Removed)
- Serverseitiges PHP-Admin-Skript (`www/admin/away.php`) vollständig entfernt; das Projekt arbeitet nun rein statisch ohne serverseitige Skriptausführung.

