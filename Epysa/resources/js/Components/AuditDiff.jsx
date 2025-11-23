import React from "react";

export default function AuditDiff({ before = {}, after = {} }) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];

    if (keys.length === 0) {
        return <p className="text-gray-500 text-sm">Sin cambios registrados.</p>;
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
                {keys.map(key => (
                    <tr key={key} className="border-t">
                        <td className="px-2 py-1 font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                        </td>
                        <td className="px-2 py-1 text-red-600">
                            {before[key] ?? "—"}
                        </td>
                        <td className="px-2 py-1 text-green-600">
                            {after[key] ?? "—"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
