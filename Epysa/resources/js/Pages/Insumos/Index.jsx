import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";
export default function Index() {
    const { insumos } = usePage().props;

    const formatCLP = (num) =>
        new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
        }).format(num);

    return (
        
        <div className="min-h-screen bg-gray-100 ">
            <Head title="Lista de Insumos" />
            <SimpleNav />
            <div className="max-w-7xl mx-auto bg-white shadow rounded-2xl p-6 mt-7  ">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Lista de Insumos</h1>
                    <Link
                        href={route("insumos.create")}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90"
                    >
                        Agregar Insumo
                    </Link>
                </div>

                <table className="w-full border-collapse border border-gray-300 text-sm ">
                    <thead className="bg-blue-600 text-white rounded-lg ">
                        <tr >
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Imagen</th>
                            <th className="border p-2">Nombre</th>
                            <th className="border p-2">Stock</th>
                            <th className="border p-2">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumos.length === 0 && (
                            <tr >
                                <td
                                    colSpan="5"
                                    className="p-4 text-center text-gray-500 "
                                >
                                    No hay insumos aún
                                </td>
                            </tr>
                        )}
                        {insumos.map((insumo) => (
                            <tr
                                key={insumo.id_insumo}
                                className="hover:bg-gray-50 font-medium"
                            >
                                <td className="border p-2 text-center">
                                    {insumo.id_insumo}
                                </td>
                                <td className="border p-2 text-center">
                                    <img
                                        src={route(
                                            "insumos.imagen",
                                            insumo.id_insumo
                                        )}
                                        alt={insumo.nombre_insumo}
                                        className="h-14 mx-auto object-cover rounded"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }} // si no hay imagen
                                    />
                                </td>
                                <td className="border p-2">
                                    {insumo.nombre_insumo}
                                </td>
                                <td className="border p-2 text-center">
                                    {insumo.stock}
                                </td>
                                <td className="border p-2 text-right">
                                    {formatCLP(insumo.precio_insumo)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
