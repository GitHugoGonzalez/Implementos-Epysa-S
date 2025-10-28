@php
@endphp

@component('mail::message')

# Solicitud rechazada por Logística — Implementos

**Solicitud:** #{{ $info['solicitud']['id'] }}  
**Insumo:** {{ $info['insumo'] }}  
**Cantidad:** {{ $info['solicitud']['cantidad'] }}  
**Sucursal:** {{ $info['sucursal'] }}  
**Fecha solicitud:** {{ \Illuminate\Support\Carbon::parse($info['solicitud']['fecha_sol'])->format('d/m/Y') }}

**Motivo del rechazo:**  
{{ $motivo }}

@if($nuevaFecha)
**Nueva fecha propuesta:** {{ \Illuminate\Support\Carbon::parse($nuevaFecha)->format('d/m/Y') }}
@endif

{{-- Subcopy opcional, texto pequeño --}}
@component('mail::subcopy')
Este correo fue emitido por <strong>Implementos</strong>. Si tienes dudas, por favor responde a este mensaje o contacta a tu administrador.
@endcomponent

Gracias,  
**Implementos**
@endcomponent
