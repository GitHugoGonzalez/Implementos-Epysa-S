export const ACTION_LABELS = {
    CREAR_INSUMO: "Creación de insumo",
    ACTUALIZAR_INSUMO: "Actualización de insumo",
    ELIMINAR_INSUMO: "Eliminación de insumo",

    CREAR_SOLICITUD: "Creación de solicitud",
    ACTUALIZAR_SOLICITUD: "Actualización de solicitud",

    APROBAR_SOLICITUD_ENCARGADO: "Aprobación de solicitud (Encargado)",
    RECHAZAR_SOLICITUD_ENCARGADO: "Rechazo de solicitud (Encargado)",

    APROBAR_SOLICITUD_JEFE: "Aprobación de solicitud (Jefe)",
    RECHAZAR_SOLICITUD_JEFE: "Rechazo de solicitud (Jefe)",

    CREAR_USUARIO: "Creación de usuario",
};

export function getActionLabel(key) {
    return ACTION_LABELS[key] ?? key.replace(/_/g, " ").toLowerCase();
}
