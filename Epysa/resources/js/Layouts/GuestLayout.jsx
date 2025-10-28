// resources/js/Layouts/GuestLayout.jsx

export default function GuestLayout({ children, bare = false }) {
    // Modo "bare": no logo, sin card, sin contenedor centrado
    if (bare) {
        return <div className="min-h-screen bg-white">{children}</div>;
    }

    // Modo clásico (por si lo ocupas en otras vistas públicas)
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
          

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
