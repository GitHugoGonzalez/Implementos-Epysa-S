<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud Aprobada por Logística</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .badge {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
            display: inline-block;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
        }
        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .section-title {
            color: #28a745;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-title i {
            margin-right: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #28a745;
        }
        .info-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 14px;
            color: #333;
            font-weight: 500;
        }
        .logistica-details {
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 6px;
            padding: 20px;
            margin-top: 10px;
        }
        .timeline {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            position: relative;
        }
        .timeline::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 10%;
            right: 10%;
            height: 2px;
            background: #28a745;
            z-index: 1;
        }
        .timeline-item {
            text-align: center;
            position: relative;
            z-index: 2;
            flex: 1;
        }
        .timeline-point {
            width: 20px;
            height: 20px;
            background: #28a745;
            border-radius: 50%;
            margin: 0 auto 10px;
            position: relative;
        }
        .timeline-point.completed {
            background: #28a745;
        }
        .timeline-point.current {
            background: #ffc107;
        }
        .timeline-point.pending {
            background: #6c757d;
        }
        .timeline-label {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #eaeaea;
        }
        .footer-text {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-approved {
            background: #d4edda;
            color: #155724;
        }
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        .status-transit {
            background: #cce7ff;
            color: #004085;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .timeline {
                flex-direction: column;
                align-items: flex-start;
            }
            .timeline::before {
                display: none;
            }
            .timeline-item {
                margin-bottom: 15px;
                text-align: left;
                display: flex;
                align-items: center;
            }
            .timeline-point {
                margin: 0 15px 0 0;
                flex-shrink: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Solicitud Aprobada por Logística</h1>
            <div class="badge">Solicitud #{{ $info['solicitud']['id'] }}</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Información General -->
            <div class="section">
                <div class="section-title">
                    Información de la Solicitud
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Número de Solicitud</div>
                        <div class="info-value">#{{ $info['solicitud']['id'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Fecha de Solicitud</div>
                        <div class="info-value">{{ \Carbon\Carbon::parse($info['solicitud']['fecha_sol'])->format('d/m/Y') }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Insumo Solicitado</div>
                        <div class="info-value">{{ $info['insumo'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Cantidad</div>
                        <div class="info-value">{{ $info['solicitud']['cantidad'] }} unidades</div>
                    </div>
                    <div class="info-item" style="grid-column: span 2;">
                        <div class="info-label">Sucursal Destino</div>
                        <div class="info-value">{{ $info['sucursal'] }}</div>
                    </div>
                </div>
            </div>

            <!-- Detalles de Logística -->
            <div class="section">
                <div class="section-title">
                    Detalles de Logística
                </div>
                <div class="logistica-details">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Fecha de Envío</div>
                            <div class="info-value">{{ \Carbon\Carbon::parse($info['logistica']['fecha_envio'])->format('d/m/Y') }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Fecha Estimada de Entrega</div>
                            <div class="info-value">{{ \Carbon\Carbon::parse($info['logistica']['fecha_estimada'])->format('d/m/Y') }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Número de Camión</div>
                            <div class="info-value">{{ $info['logistica']['numero_camion'] }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Ruta Asignada</div>
                            <div class="info-value">{{ $info['logistica']['ruta_asignada'] }}</div>
                        </div>
                        <div class="info-item" style="grid-column: span 2;">
                            <div class="info-label">Estado Actual</div>
                            <div class="info-value">
                                @if($info['logistica']['estado'] === 'pendiente')
                                    <span class="status-badge status-pending">Pendiente de Envío</span>
                                @elseif($info['logistica']['estado'] === 'en_transito')
                                    <span class="status-badge status-transit">En Tránsito</span>
                                @else
                                    <span class="status-badge status-approved">Aprobado</span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progreso -->
            <div class="section">
                <div class="section-title">
                    Progreso del Envío
                </div>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-point completed"></div>
                        <div class="timeline-label">Solicitud<br>Aprobada</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-point {{ in_array($info['logistica']['estado'], ['pendiente', 'en_transito']) ? 'completed' : 'current' }}"></div>
                        <div class="timeline-label">Planificación<br>Logística</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-point {{ $info['logistica']['estado'] === 'en_transito' ? 'completed' : ($info['logistica']['estado'] === 'pendiente' ? 'current' : 'pending') }}"></div>
                        <div class="timeline-label">En<br>Tránsito</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-point pending"></div>
                        <div class="timeline-label">Entrega<br>Completada</div>
                    </div>
                </div>
            </div>

            <!-- Información de Aprobación -->
            <div class="section">
                <div class="section-title">
                    👤 Información de Aprobación
                </div>
                <div class="info-item">
                    <div class="info-label">Aprobado por</div>
                    <div class="info-value">{{ $info['aprobado_por'] }} (Departamento de Logística)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Solicitante</div>
                    <div class="info-value">{{ $info['solicitante']['name'] }}</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Este es un correo automático del Sistema de Gestión Logística.<br>
                Por favor no responda a este mensaje.
            </div>
            <div class="footer-text">
                Fecha de envío: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}
            </div>
        </div>
    </div>
</body>
</html>