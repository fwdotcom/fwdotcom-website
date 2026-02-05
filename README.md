# www.frankwinter.com Webseite
In diesem Repository wird die Webseite www.frankwinter.com verwaltet.

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
