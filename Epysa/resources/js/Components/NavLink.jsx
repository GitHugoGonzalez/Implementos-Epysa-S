import { Link } from "@inertiajs/react";

export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                active
                    ? "inline-flex items-center px-3 py-2 rounded-md bg-blue-700 text-white font-medium text-lg"
                    : "inline-flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-500 text-lg"
            }
        >
            {children}
        </Link>
    );
}
