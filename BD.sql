-- ==================================================
-- BASE DE DATOS ESTRUCTURA + DATOS BASE + EJEMPLOS
-- ==================================================
DROP DATABASE IF EXISTS Epysa;
CREATE DATABASE Epysa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Epysa;

-- ==========================
-- TABLAS BASE
-- ==========================

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
  categoria VARCHAR(100),
  prep_minutos INT,
  transporte_minutos INT,
  sla_dias_habiles INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- TABLAS PRINCIPALES
-- ==========================

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
  motivo VARCHAR(500) NULL,
  es_urgente BOOLEAN DEFAULT FALSE,
  observaciones TEXT,
  FOREIGN KEY (id_us) REFERENCES Usuarios(id_us),
  FOREIGN KEY (id_sucursal) REFERENCES Sucursal(id_sucursal),
  FOREIGN KEY (id_insumo) REFERENCES Insumos(id_insumo),
  FOREIGN KEY (id_estado) REFERENCES Estado(id_estado)
);

-- ==========================
-- TABLAS DEPENDIENTES
-- ==========================

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

-- ==========================
-- NUEVA TABLA: HISTORIAL DE INSUMOS
-- ==========================

CREATE TABLE Historial_Insumos (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  nombre_insumo VARCHAR(150) NOT NULL,
  fecha_creacion TIMESTAMP NULL,
  fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo_eliminacion VARCHAR(255) NULL
);

-- ==========================
-- NUEVA TABLA: AUDITORÍA
-- ==========================

CREATE TABLE Auditoria (
    id_audit INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    accion VARCHAR(150) NOT NULL,
    valores_antes JSON NULL,
    valores_despues JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id_us)
);


-- ==========================
-- DATOS BASE
-- ==========================

-- Roles
INSERT INTO Roles (nombre_rol) VALUES
('operario'),
('encargado'),
('jefe'),
('logistica');

-- Sucursales
INSERT INTO Sucursal (direccion, ciudad) VALUES
('Av. Las Industrias 2350', 'Santiago'),
('Ruta 5 Km 18', 'Rancagua'),
('Camino Viejo 123', 'Concepción');

-- Estados
INSERT INTO Estado (desc_estado) VALUES
('pendiente'),
('aprobado encargado'),
('aprobado jefe'),
('rechazado encargado'),
('rechazado jefe'),
('rechazado logística');

-- ==========================
-- USUARIOS (contraseña: 12345678)
-- ==========================

INSERT INTO Usuarios (name, email, password, id_rol, id_sucursal) VALUES
('Carlos Pérez',  'operario@gmail.com', '$2y$12$daYo.CTP/ki2D3G67B0euO04j0MBVfGk7Fzje0pit6qhyFFP.Bq.e', 1, 1),
('Ana Torres',    'encargado@gmail.com', '$2y$12$daYo.CTP/ki2D3G67B0euO04j0MBVfGk7Fzje0pit6qhyFFP.Bq.e', 2, 1),
('Luis Herrera',  'jefe@gmail.com',      '$2y$12$daYo.CTP/ki2D3G67B0euO04j0MBVfGk7Fzje0pit6qhyFFP.Bq.e', 3, 1),
('Laura Díaz',    'logistica@gmail.com', '$2y$12$daYo.CTP/ki2D3G67B0euO04j0MBVfGk7Fzje0pit6qhyFFP.Bq.e', 4, 1);

-- ==========================
-- INSUMOS
-- ==========================

INSERT INTO Insumos (nombre_insumo, stock, descripcion_insumo, precio_insumo, categoria, prep_minutos, transporte_minutos, sla_dias_habiles)
VALUES
('Filtro de aceite', 100, 'Filtro estándar para motor diésel', 8900, 'Mecánica', 10, 30, 3),
('Aceite sintético 5W30', 250, 'Lubricante de alto rendimiento', 19900, 'Lubricantes', 5, 20, 2),
('Pastillas de freno', 80, 'Juego delantero de pastillas de freno', 29900, 'Frenos', 15, 45, 4),
('Refrigerante verde', 150, 'Refrigerante orgánico concentrado', 14900, 'Refrigeración', 8, 25, 3),
('Neumático 205/55R16', 50, 'Neumático radial todo terreno', 65900, 'Neumáticos', 20, 60, 5);

-- ==========================
-- SOLICITUDES DE PRUEBA
-- ==========================

-- 1. Pendiente (creada por Operario)
INSERT INTO Solicitudes (id_us, id_sucursal, id_insumo, cantidad, fecha_sol, id_estado, es_urgente, observaciones)
VALUES (1, 1, 2, 10, CURDATE(), 1, FALSE, 'Solicitud pendiente del operario.');

-- 2. Aprobada por Encargado
INSERT INTO Solicitudes (id_us, id_sucursal, id_insumo, cantidad, fecha_sol, id_estado, es_urgente, observaciones)
VALUES (1, 1, 3, 4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 2, FALSE, 'Aprobada por encargado.');

INSERT INTO Aprobaciones (id_solicitud, tipo_aprobacion, aprobado_por, aprobado_at)
VALUES (2, 'Encargado', 2, NOW());

-- 3. Aprobada por Jefe (lista para Logística)
INSERT INTO Solicitudes (id_us, id_sucursal, id_insumo, cantidad, fecha_sol, id_estado, es_urgente, observaciones)
VALUES (1, 1, 4, 6, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 3, TRUE, 'Lista para envío.');

INSERT INTO Aprobaciones (id_solicitud, tipo_aprobacion, aprobado_por, aprobado_at)
VALUES 
(3, 'Encargado', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'Jefe', 3, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 4. Rechazada por Jefe
INSERT INTO Solicitudes (id_us, id_sucursal, id_insumo, cantidad, fecha_sol, id_estado, es_urgente, observaciones)
VALUES (1, 1, 5, 2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 5, FALSE, 'Solicitud rechazada por jefe.');

INSERT INTO Aprobaciones (id_solicitud, tipo_aprobacion, aprobado_por, aprobado_at, rechazo_motivo)
VALUES (4, 'Jefe', 3, NULL, 'Stock insuficiente en bodega.');

-- ==========================
-- FIN DEL SCRIPT
-- ==========================

