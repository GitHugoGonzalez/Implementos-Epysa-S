-- =====================
-- TABLAS BASE
-- =====================

CREATE TABLE Roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(100) NOT NULL
);

CREATE TABLE Sucursal (
  id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL
);

CREATE TABLE Estado (
  id_estado INT AUTO_INCREMENT PRIMARY KEY,
  desc_estado VARCHAR(100) NOT NULL
);

CREATE TABLE Insumos (
  id_insumo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_insumo VARCHAR(150) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  descripcion_insumo TEXT,
  precio_insumo DECIMAL(12,2) NOT NULL,
  prep_minutos INT,
  transporte_minutos INT,
  sla_dias_habiles INT
);

-- =====================
-- TABLAS PRINCIPALES
-- =====================

CREATE TABLE Usuarios (
  id_us INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  id_sucursal INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_login DATETIME,
  estado_usuario ENUM('activo','inactivo') DEFAULT 'activo',
  FOREIGN KEY (id_rol) REFERENCES Roles(id_rol),
  FOREIGN KEY (id_sucursal) REFERENCES Sucursal(id_sucursal)
);

CREATE TABLE Solicitudes (
  id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
  id_us INT NOT NULL,
  id_sucursal INT NOT NULL,
  id_insumo INT NOT NULL,
  cantidad INT NOT NULL,
  fecha_sol DATE NOT NULL,
  id_estado INT NOT NULL,
  es_urgente BOOLEAN DEFAULT FALSE,
  observaciones TEXT,
  FOREIGN KEY (id_us) REFERENCES Usuarios(id_us),
  FOREIGN KEY (id_sucursal) REFERENCES Sucursal(id_sucursal),
  FOREIGN KEY (id_insumo) REFERENCES Insumos(id_insumo),
  FOREIGN KEY (id_estado) REFERENCES Estado(id_estado)
);

-- =====================
-- TABLAS DEPENDIENTES
-- =====================

CREATE TABLE Insumo_Imagen (
  id_imagen INT AUTO_INCREMENT PRIMARY KEY,
  id_insumo INT NOT NULL,
  imagen LONGBLOB,
  mime VARCHAR(50),
  FOREIGN KEY (id_insumo) REFERENCES Insumos(id_insumo)
);

CREATE TABLE Aprobaciones (
  id_aprobacion INT AUTO_INCREMENT PRIMARY KEY,
  id_solicitud INT NOT NULL,
  tipo_aprobacion ENUM('Encargado','Jefe','Supervisor') NOT NULL,
  aprobado_por INT NOT NULL,
  aprobado_at DATETIME,
  rechazo_motivo VARCHAR(255),
  FOREIGN KEY (id_solicitud) REFERENCES Solicitudes(id_solicitud),
  FOREIGN KEY (aprobado_por) REFERENCES Usuarios(id_us)
);

CREATE TABLE Logistica (
  id_logistica INT AUTO_INCREMENT PRIMARY KEY,
  id_solicitud INT NOT NULL,
  id_usuario INT,
  fecha_envio DATE,
  fecha_estimada DATE,
  numero_camion VARCHAR(50),
  ruta_asignada VARCHAR(255),
  rechazo_motivo VARCHAR(255),
  rechazado_at DATETIME,
  fecha_entrega_real DATE,
  estado_logistica ENUM('pendiente','en_transito','entregado','rechazado') DEFAULT 'pendiente',
  FOREIGN KEY (id_solicitud) REFERENCES Solicitudes(id_solicitud),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_us)
);

CREATE TABLE Auditoria (
  id_audit INT AUTO_INCREMENT PRIMARY KEY,
  id_us INT NOT NULL,
  last_modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accion ENUM('CREAR','MODIFICAR','ELIMINAR') NOT NULL,
  FOREIGN KEY (id_us) REFERENCES Usuarios(id_us),
  FOREIGN KEY (last_modified_by) REFERENCES Usuarios(id_us)
);

-- =====================
-- TABLAS ADICIONALES (para RF específicos)
-- =====================

CREATE TABLE Notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo ENUM('correo','sistema') NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado_envio ENUM('pendiente','enviado','fallido') DEFAULT 'pendiente',
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_us)
);

