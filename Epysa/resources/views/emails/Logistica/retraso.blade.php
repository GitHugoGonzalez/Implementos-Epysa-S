@component('mail::message')
# Actualización de fecha de entrega (retraso)

**Solicitud:** #{{ $info['solicitud']['id'] }}  
**Insumo:** {{ $info['insumo'] }}  
**Cantidad:** {{ $info['solicitud']['cantidad'] }}  
**Sucursal:** {{ $info['sucursal'] }}  
**Fecha solicitud:** {{ \Illuminate\Support\Carbon::parse($info['solicitud']['fecha_sol'])->format('d/m/Y') }}

@if($motivo)
**Motivo / Comentario:**  
{{ $motivo }}
@endif

> La fecha estimada de entrega fue postergada. Por favor revisar el detalle en el sistema.

@component('mail::button', ['url' => config('app.url') . '/logistica'])
Ver en sistema
@endcomponent

Gracias,  
**{{ config('app.name') }}**
@endcomponent
