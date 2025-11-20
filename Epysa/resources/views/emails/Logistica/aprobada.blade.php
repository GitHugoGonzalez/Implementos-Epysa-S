@php
@endphp

@component('mail::message')

# ✅ Solicitud Aprobada por Logística — Implementos

Tu solicitud ha sido **aprobada** por el área de Logística y está en proceso de envío.

**Solicitud:** #{{ $info['solicitud']['id'] }}  
**Insumo:** {{ $info['insumo'] }}  
**Cantidad:** {{ $info['solicitud']['cantidad'] }}  
**Sucursal:** {{ $info['sucursal'] }}  
**Fecha solicitud:** {{ \Illuminate\Support\Carbon::parse($info['solicitud']['fecha_sol'])->format('d/m/Y') }}

@if($comentario)
**Comentario de Logística:**  
{{ $comentario }}
@endif

---

**Estado:** Tu pedido está siendo preparado para el envío. Recibirás una notificación cuando esté en tránsito con los detalles de entrega.

{{-- Subcopy opcional, texto pequeño --}}
@component('mail::subcopy')
Este correo fue emitido por <strong>Implementos</strong>. Si tienes dudas, por favor responde a este mensaje o contacta a tu administrador.
@endcomponent

Gracias,  
**Implementos**
@endcomponent
