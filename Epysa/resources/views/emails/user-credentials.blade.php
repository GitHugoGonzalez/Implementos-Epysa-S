<!doctype html>
<html>
<head><meta charset="utf-8"><title>Credenciales</title></head>
<body>
  <h2> Hola {{ $p['name'] ?? 'Usuario' }}</h2>
  <p>Se ha creado una cuenta para ti. Estos son tus datos de acceso:</p>

  <ul>
    <li><strong>Email:</strong> {{ $p['email'] }}</li>
    <li><strong>Contraseña:</strong> {{ $p['plain_password'] }}</li>
    <li><strong>Rol:</strong> {{ $p['rol'] ?? '—' }}</li>
    @if(!empty($p['sucursal']))
      <li><strong>Sucursal:</strong> {{ $p['sucursal'] }}</li>
    @endif
  </ul>

  @if(!empty($p['login_url']))
    <p>Puedes ingresar aquí: <a href="{{ $p['login_url'] }}">{{ $p['login_url'] }}</a></p>
  @endif

  <p>Por seguridad, te recomendamos cambiar la contraseña al primer ingreso.</p>
</body>
</html>
