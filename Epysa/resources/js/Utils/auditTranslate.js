export function translateAuditChanges(before, after, roles, sucursales) {
    const changes = [];

    const getRoleName = (id) => {
        const r = roles.find((x) => x.id == id);
        return r ? r.nombre : id;
    };

    const getSucursalName = (id) => {
        const s = sucursales.find((x) => x.id == id);
        return s ? s.nombre : id;
    };

    const fieldsMap = {
        id_rol: {
            label: "Rol",
            translate: getRoleName,
        },
        id_sucursal: {
            label: "Sucursal",
            translate: getSucursalName,
        },
        name: { label: "Nombre" },
        email: { label: "Correo" },
        estado_usuario: { label: "Estado" },
        password: { label: "Contraseña" },
    };

    Object.keys(after).forEach((key) => {
        if (!fieldsMap[key]) return;

        const label = fieldsMap[key].label;
        const translate =
            fieldsMap[key].translate || ((v) => v ?? "—");

        const beforeVal = translate(before[key]);
        const afterVal = translate(after[key]);

        if (beforeVal !== afterVal) {
            changes.push({
                campo: label,
                antes: beforeVal,
                despues: afterVal,
            });
        }
    });

    return changes;
}
