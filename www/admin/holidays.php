<?php
declare(strict_types=1);

// Ziel-Datei
$targetFile = __DIR__ . '/holidays.json';

// Hilfsfunktion: Datum validieren (YYYY-MM-DD)
function isValidDate(string $date): bool {
	$dt = DateTime::createFromFormat('Y-m-d', $date);
	return $dt && $dt->format('Y-m-d') === $date;
}

// Hilfsfunktion: JSON atomar schreiben
function writeJsonAtomically(string $file, array $data): void {
	$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
	if ($json === false) {
		throw new RuntimeException('JSON konnte nicht erzeugt werden.');
	}

	$tmp = $file . '.tmp';
	if (file_put_contents($tmp, $json . PHP_EOL, LOCK_EX) === false) {
		throw new RuntimeException('Temporäre Datei konnte nicht geschrieben werden.');
	}

	if (!rename($tmp, $file)) {
		@unlink($tmp);
		throw new RuntimeException('Datei konnte nicht ersetzt werden.');
	}
}

// Aktuelle Werte laden (falls vorhanden)
$current = [
	'from' => '',
	'to'   => ''
];

if (is_file($targetFile)) {
	$raw = file_get_contents($targetFile);
	$data = json_decode($raw ?: '', true);
	if (is_array($data)) {
		$current = array_merge($current, $data);
	}
}

$errors = [];
$saved = false;

// Formularverarbeitung
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$from = trim($_POST['from'] ?? '');
	$to   = trim($_POST['to'] ?? '');

	if (!isValidDate($from)) {
		$errors[] = 'Von-Datum ist ungültig (Format YYYY-MM-DD).';
	}
	if (!isValidDate($to)) {
		$errors[] = 'Bis-Datum ist ungültig (Format YYYY-MM-DD).';
	}

	if (!$errors) {
		$fromDt = new DateTime($from);
		$toDt   = new DateTime($to);

		if ($toDt < $fromDt) {
			$errors[] = 'Bis-Datum muss nach dem Von-Datum liegen.';
		}
	}

	if (!$errors) {
		try {
			writeJsonAtomically($targetFile, [
				'from' => $from,
				'to'   => $to
			]);
			$current['from'] = $from;
			$current['to']   = $to;
			$saved = true;
		} catch (Throwable $e) {
			$errors[] = $e->getMessage();
		}
	}
}
?>
<!doctype html>
<html lang="de">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Holiday-Zeitraum setzen</title>
	<style>
		body {
			font-family: system-ui, Arial, sans-serif;
			max-width: 520px;
			margin: 40px auto;
			padding: 0 16px;
		}
		label {
			display: block;
			margin-top: 16px;
			font-weight: 600;
		}
		input {
			width: 100%;
			padding: 10px;
			font-size: 16px;
			margin-top: 6px;
		}
		button {
			margin-top: 20px;
			padding: 10px 16px;
			font-size: 16px;
			cursor: pointer;
		}
		.msg {
			margin-top: 16px;
			padding: 12px;
			border-radius: 6px;
		}
		.ok { background: #e7f7ec; }
		.err { background: #fde8e8; }
		code {
			background: #f2f2f2;
			padding: 2px 6px;
			border-radius: 4px;
		}
	</style>
</head>
<body>

<h1>Holiday-Zeitraum</h1>

<?php if ($saved): ?>
	<div class="msg ok">
		Gespeichert. Frontend liest jetzt <code>holidays.json</code>.
	</div>
<?php endif; ?>

<?php if ($errors): ?>
	<div class="msg err">
		<strong>Fehler:</strong>
		<ul>
			<?php foreach ($errors as $err): ?>
				<li><?= htmlspecialchars($err, ENT_QUOTES, 'UTF-8') ?></li>
			<?php endforeach; ?>
		</ul>
	</div>
<?php endif; ?>

<form method="post">
	<label for="from">Von</label>
	<input id="from" type="date" name="from"
	       value="<?= htmlspecialchars($current['from'], ENT_QUOTES, 'UTF-8') ?>">

	<label for="to">Bis</label>
	<input id="to" type="date" name="to"
	       value="<?= htmlspecialchars($current['to'], ENT_QUOTES, 'UTF-8') ?>">

	<button type="submit">Speichern</button>
</form>

<hr>

<p>Aktuelle Datei: <code><?= htmlspecialchars(basename($targetFile), ENT_QUOTES, 'UTF-8') ?></code></p>

</body>
</html>
