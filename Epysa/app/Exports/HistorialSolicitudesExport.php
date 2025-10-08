<?php

namespace App\Exports;

use App\Models\Solicitud;
use Illuminate\Contracts\Support\Responsable;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Excel as ExcelWriter; // 👈 añade esto

class HistorialSolicitudesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, Responsable
{
    use Exportable;

    /** @var array<string,mixed> */
    private array $filters;

    // Para Responsable (descarga directa)
    public string $fileName   = 'historial_solicitudes.xlsx';
    public string $writerType = ExcelWriter::XLSX; // 👈 fuerza XLSX
    public array  $headers    = [                  // 👈 headers explícitos
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $q        = $this->filters['q']        ?? null;
        $estadoId = $this->filters['estado']   ?? null;
        $sucursal = $this->filters['sucursal'] ?? null;

        return Solicitud::on('newdb')
            ->with([
                'usuario:id_us,name,email',
                'sucursal:id_sucursal,ciudad,direccion',
                'insumo:id_insumo,nombre_insumo',
                'estado:id_estado,desc_estado',
            ])
            ->when($q, function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('id_solicitud', 'like', "%{$q}%")
                       ->orWhere('cantidad', 'like', "%{$q}%")
                       ->orWhereHas('usuario', fn($u) =>
                           $u->where('name', 'like', "%{$q}%")
                             ->orWhere('email', 'like', "%{$q}%"))
                       ->orWhereHas('sucursal', fn($s) =>
                           $s->where('ciudad', 'like', "%{$q}%")
                             ->orWhere('direccion', 'like', "%{$q}%"))
                       ->orWhereHas('insumo', fn($i) =>
                           $i->where('nombre_insumo', 'like', "%{$q}%"))
                       ->orWhereHas('estado', fn($e) =>
                           $e->where('desc_estado', 'like', "%{$q}%"));
                });
            })
            ->when($estadoId, fn($q2) => $q2->where('id_estado', $estadoId))
            ->when($sucursal, fn($q2) => $q2->where('id_sucursal', $sucursal))
            ->orderBy('fecha_sol', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'N° Solicitud',
            'Estado',
            'Sucursal',
            'Solicitante',
            'Correo',
            'Insumo',
            'Cantidad',
        ];
    }

    public function map($row): array
    {
        $sucursal = '';
        if ($row->sucursal) {
            $parts = array_filter([$row->sucursal->ciudad ?? null, $row->sucursal->direccion ?? null]);
            $sucursal = implode(' - ', $parts);
        }

        return [
            (string) $row->fecha_sol,                // YYYY-MM-DD
            $row->id_solicitud,
            optional($row->estado)->desc_estado,
            $sucursal,
            optional($row->usuario)->name,
            optional($row->usuario)->email,
            optional($row->insumo)->nombre_insumo,
            $row->cantidad,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        $sheet->setAutoFilter($sheet->calculateWorksheetDimension());

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $sheet->getStyle('A1:H1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFEFEFEF');

        return [];
    }
}
