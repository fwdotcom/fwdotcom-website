# www.frankwinter.com Webseite
In diesem Repository wird die Webseite www.frankwinter.com verwaltet.

### Funktionsbeschreibung
Die Webseite [www.frankwinter.com](https://www.frankwinter.com) dient als persönliche Präsentationsseite.


**Hauptfunktionen:**
- Darstellung von Inhalten und Bildern im modernen, responsiven Design
- Automatischer „Sleeping Mode“: Zwischen 22:00 und 06:00 Uhr wird ein spezielles Bild angezeigt (alternativ jederzeit über den URL-Parameter `?sleeping`)
- Optimierte Bildauslieferung (WebP-Format)

**Interaktive Funktionen:**
- Mit dem URL-Parameter `?awake` kann der Sleeping Mode gezielt deaktiviert werden (unabhängig von der Uhrzeit).
- Ein Klick oder längeres Halten auf das Portrait zeigt im Schlafmodus ein "wach"-Bild (sleeping_open_eyes) oder im Normalmodus eine zufällige Bildvariante an. Beim Loslassen kehrt das Bild zum Ausgangszustand zurück.

Weitere Details zur Bildkonvertierung und zum Deployment finden sich weiter unten in dieser Datei.

### Deployment auf den Webserver
Mittels der Action „Deploy on Web Server“ wird die Webseite aus dem Verzeichnis `www/` auf den Webserver beim Webhoster (Webgo) übertragen.

#### Benötigte Repository Secrets:

| Secret            | Zweck                                     | Ermittlung / Quelle |
| ----------------- | ----------------------------------------- | ------------------- |
| `DEPLOY_PATH`     | Zielverzeichnis auf dem Webserver         | Absoluter Pfad auf dem Server, in den deployed wird. **Wichtig:** Dieses Verzeichnis darf ausschließlich die Website enthalten, da `rsync --delete` aktiv ist. |
| `SSH_HOST`        | Zielhost für SSH                          | Hostname oder IP-Adresse des Servers beim Webhoster (ohne Protokoll, ohne Port). |
| `SSH_KNOWN_HOSTS` | Vertrauenswürdiger Host-Key des Servers   | Lokal ausführen: `ssh-keyscan -H [-p SSH_PORT] SSH_HOST` und die komplette Ausgabe **unverändert** als Secret speichern. Host und Port müssen exakt zu `SSH_HOST` und `SSH_PORT` passen. |
| `SSH_PORT`        | SSH-Port des Zielservers                  | Falls Standard-Port **22** genutzt wird: leer lassen. Andernfalls den Port angeben, der auch bei `ssh -p <PORT>` verwendet wird (z. B. `2222`). |
| `SSH_PRIVATE_KEY` | Privater SSH-Schlüssel für das Deployment | Deploy-Key lokal erzeugen: `ssh-keygen -t ed25519 -f deploy_key` → Inhalt der Datei `deploy_key` (privater Schlüssel) vollständig als Secret hinterlegen. **Ohne Passphrase.** |
| `SSH_USER`        | SSH-Benutzer für das Deployment           | Benutzername auf dem Webserver, über den das Deployment per SSH erfolgt. |

##### Hinweis zum SSH-Schlüssel (Public / Private Key)

Beim Erzeugen des Deploy-Schlüssels werden **zwei Dateien** erstellt:

- `deploy_key`  
  Der **private Schlüssel**.  
  Dieser Schlüssel wird **ausschließlich in GitHub** als Secret (`SSH_PRIVATE_KEY`) hinterlegt und darf **weder im Repository noch auf dem Webserver** gespeichert werden.

- `deploy_key.pub`  
  Der **öffentliche Schlüssel**.  
  Dieser Schlüssel muss **auf dem Webserver** beim Zielbenutzer (`SSH_USER`) in der Datei  
  `~/.ssh/authorized_keys` gespeichert werden.

Der Ablauf auf dem Webserver ist dabei:

1. Als Zielbenutzer (`SSH_USER`) anmelden
2. Sicherstellen, dass das Verzeichnis `~/.ssh` existiert und korrekt berechtigt ist
3. Den Inhalt von `deploy_key.pub` in `~/.ssh/authorized_keys` einfügen

Der Webserver vertraut damit dem **öffentlichen Schlüssel**, während der **private Schlüssel ausschließlich im GitHub Runner** verwendet wird.  
Nur wenn **privater und öffentlicher Schlüssel korrekt zueinander passen**, ist eine SSH-Authentifizierung für das Deployment möglich.


---

### Bilder konvertieren (PNG → WebP)
Um Bilder (z. B. für die Webseite) effizienter zu machen, können PNG-Dateien mit [ImageMagick](https://imagemagick.org/) in das WebP-Format konvertiert werden. Beispiel für eine Bash-Konvertierung aller PNGs in einem Ordner:

```bash
#!/bin/bash
cd "/mnt/c/Users/Frank/Downloads/clay_frank"
for f in *.png; do
  echo "Converting: $f"
  magick "$f" -resize 1000x1000! "${f%.png}.webp"
done
echo "Done!"
```

**Hinweis:**
- Das Skript setzt voraus, dass [ImageMagick](https://imagemagick.org/) installiert ist und der Befehl `magick` verfügbar ist.
- Die Option `-resize 1000x1000!` erzwingt die Größe 1000x1000 Pixel (ohne Seitenverhältnis zu erhalten).
- Die konvertierten WebP-Dateien werden im gleichen Verzeichnis abgelegt.

---

### Verwaltung der Abwesenheitszeiten (away.json)

Die Datei `away.json` kann über das Admin-Interface unter [`admin/away.php`](www/admin/away.php) gepflegt werden. Sie enthält den Zeitraum, in dem das Abwesenheitsbild angezeigt wird.

Beispiel für den Inhalt von `away.json`:

```json
{
  "from": "2026-01-01",
  "to": "2026-01-05"
}
```

---

## Regeln für die Anzeige von Frank

| Anlass/Regel         | Zeitraum/Trigger                                                                 | Angezeigtes Bild                        |
|----------------------|---------------------------------------------------------------------------------|-----------------------------------------|
| Schlafmodus          | Täglich 22:00–06:00 Uhr <br> oder URL-Parameter `?sleeping`                      | clay_frank_sleeping.webp                |
| Manuelles Aufwecken  | URL-Parameter `?awake`                                                           | Normalmodus                             |
| Abwesenheit (dynamisch) | Zeitraum aus away.json                                                      | clay_frank_backsoon.webp                |
| Weihnachten          | 15.12.–27.12. (jedes Jahr)                                                       | clay_frank_xmas.webp                    |
| Oktoberfest          | 15.09.–10.10. (jedes Jahr)                                                       | clay_frank_oktoberfest.webp             |
| Halloween            | 25.10.–01.11. (jedes Jahr)                                                       | clay_frank_halloween.webp               |
| Neujahr              | 31.12.–05.01. (über Jahreswechsel)                                               | clay_frank_new_year.webp                |
| Ostern               | Palmsonntag (eine Woche vor Ostersonntag) bis Ostermontag (Datum berechnet)      | clay_frank_easter.webp                  |
| Valentinstag         | 14.02. (jedes Jahr)                                                              | clay_frank_valentinesday.webp           |
| Forcierte Saisons    | URL-Parameter `?away`, `?xmas`, `?easter`, ...                                   | Entsprechendes Saisonbild               |
| Interaktion (Klick)  | Klick/Halten im Normalmodus                                                      | Zufällige Bildvariante                  |
| Interaktion (Klick)  | Klick/Halten im Schlafmodus                                                      | clay_frank_sleeping_open_eyes.webp      |
| Standard             | Kein besonderer Anlass                                                           | clay_frank.webp + Varianten             |

- Die Regeln werden in der genannten Reihenfolge geprüft (höchste Priorität zuerst).
- Abwesenheit aus away.json hat Vorrang vor festen Saisons.
- Interaktionen (Klick/Halten) überschreiben temporär das aktuelle Bild.
