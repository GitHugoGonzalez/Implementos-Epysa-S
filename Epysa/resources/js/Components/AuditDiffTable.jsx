import React from "react";

// Mapa de etiquetas "bonitas" para los campos
const FIELD_LABELS = {
    id_solicitud: "id solicitud",         // se muestra solo el número
    id_us: "Usuario (ID)",
    id_sucursal: "Sucursal",
    id_insumo: "Insumo",
    id_estado: "Estado",

    cantidad: "Cantidad solicitada",
    fecha_sol: "Fecha de solicitud",
    motivo: "Motivo",
    observaciones: "Observaciones",

    // Por si aparecen cambios en la tabla Insumos
    nombre_insumo: "Nombre insumo",
    stock: "Stock",
    descripcion_insumo: "Descripción insumo",
    precio_insumo: "Precio insumo",
    categoria: "Categoría",
    prep_minutos: "Tiempo preparación (min)",
    transporte_minutos: "Tiempo transporte (min)",
    sla_dias_habiles: "SLA (días hábiles)",
    es_urgente: "Es urgente",
};

// Helper para buscar nombre en catálogo
function findById(catalog = [], id, fieldName = "nombre") {
    if (id === null || id === undefined || id === "") return "—";
    const item = catalog.find((x) => String(x.id) === String(id));
    if (!item) return id; // si no lo encontramos, devolvemos el ID tal cual
    return item[fieldName] ?? id;
}

// Traducción de valores según campo
function translateValue(field, value, catalogs) {
    const {
        rolesCatalogo = [],
        usuariosCatalogo = [],
        sucursalesCatalogo = [],
        estadosCatalogo = [],
        insumosCatalogo = [],
    } = catalogs || {};

    if (value === null || value === undefined) return "—";

    switch (field) {
        // 🔹 id_solicitud: solo número (como pediste)
        case "id_solicitud":
            return value;

        // 🔹 id_us → nombre de usuario
        case "id_us":
            return findById(usuariosCatalogo, value, "name");

        // 🔹 id_sucursal → nombre sucursal
        case "id_sucursal":
            return findById(sucursalesCatalogo, value, "nombre");

        // 🔹 id_insumo → nombre insumo
        case "id_insumo":
            return findById(insumosCatalogo, value, "nombre");

        // 🔹 id_estado → nombre estado
        case "id_estado":
            return findById(estadosCatalogo, value, "nombre");

        // 🔹 fecha_sol → formateada
        case "fecha_sol": {
            try {
                const d = new Date(value);
                if (isNaN(d.getTime())) return value;
                return d.toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
            } catch {
                return value;
            }
        }

        // 🔹 es_urgente → Sí / No
        case "es_urgente": {
            // puede venir como boolean, 0/1, "0"/"1"
            const v = typeof value === "boolean" ? value : String(value) === "1";
            return v ? "Sí" : "No";
        }

        default:
            return value;
    }
}

// Traducción de etiqueta de campo
function getFieldLabel(field) {
    if (FIELD_LABELS[field]) return FIELD_LABELS[field];
    return field.replace(/_/g, " ");
}

export default function AuditDiffTable({
    before = {},
    after = {},
    catalogs = {},
}) {
    // conjunto de todas las llaves que aparecen en before o after
    const keys = Array.from(
        new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
    );

    // Solo mostramos filas donde realmente cambió algo
    const rows = keys
        .map((key) => {
            const rawBefore = before ? before[key] : undefined;
            const rawAfter = after ? after[key] : undefined;

            // si no cambió, no mostramos
            if (
                (rawBefore === undefined || rawBefore === null) &&
                (rawAfter === undefined || rawAfter === null)
            ) {
                return null;
            }

            // comparación laxa para que "3" y 3 cuenten como igual
            if (rawBefore == rawAfter) {
                return null;
            }

            const label = getFieldLabel(key);
            const valBefore = translateValue(key, rawBefore, catalogs);
            const valAfter = translateValue(key, rawAfter, catalogs);

            return {
                campo: label,
                antes: valBefore,
                despues: valAfter,
            };
        })
        .filter(Boolean);

    if (rows.length === 0) {
        return (
            <p className="text-gray-500 text-xs">
                Sin cambios relevantes para este registro.
            </p>
        );
    }

    return (
        <table className="min-w-full border rounded-lg text-xs bg-white">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-2 py-1 text-left">Campo</th>
                    <th className="px-2 py-1 text-left">Antes</th>
                    <th className="px-2 py-1 text-left">Después</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx} className="border-t">
                        <td className="px-2 py-1 font-medium">{row.campo}</td>
                        <td className="px-2 py-1 text-red-600">{row.antes}</td>
                        <td className="px-2 py-1 text-green-600">{row.despues}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
