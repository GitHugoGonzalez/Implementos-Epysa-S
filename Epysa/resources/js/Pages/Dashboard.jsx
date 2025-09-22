import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 space-y-4">
                            <p>You're logged in!</p>

                            {/* 👉 Botón para ir a la vista de agregar insumo */}
                            <Link
                                href="/insumos/crear"
                                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
                            >
                                ➕ Agregar Insumo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
