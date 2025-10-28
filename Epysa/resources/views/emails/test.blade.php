<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Credenciales de la Base de Datos</title>
</head>
<body>
    <h2>📦 Credenciales de Conexión a la Base de Datos</h2>

    <ul>
        <li><strong>Tipo:</strong> {{ $dbCredentials['DB_CONNECTION'] }}</li>
        <li><strong>Host:</strong> {{ $dbCredentials['DB_HOST'] }}</li>
        <li><strong>Puerto:</strong> {{ $dbCredentials['DB_PORT'] }}</li>
        <li><strong>Base de Datos:</strong> {{ $dbCredentials['DB_DATABASE'] }}</li>
        <li><strong>Usuario:</strong> {{ $dbCredentials['DB_USERNAME'] }}</li>
        <li><strong>Contraseña:</strong> {{ $dbCredentials['DB_PASSWORD'] }}</li>
    </ul>

    <p>⚠️ Este mensaje solo debe usarse para pruebas internas.</p>
</body>
</html>
