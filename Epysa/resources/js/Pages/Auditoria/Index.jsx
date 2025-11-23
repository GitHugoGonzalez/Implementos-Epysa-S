import React, { useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";

import {
    Grid,
    TextField,
    Paper,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InputAdornment from "@mui/material/InputAdornment";

import { getActionLabel } from "@/Utils/AuditLabels";
import AuditTable from "@/Components/AuditTable";

export default function AuditoriaIndex() {

    const {
        logs = { data: [], links: [], from: 0, to: 0, total: 0 },
        filtros = {},
        sucursales = [],          // PARA FILTROS
        rolesCatalogo = [],       // PARA AUDIT TABLE
        usuariosCatalogo = [],    // PARA AUDIT TABLE
        sucCatalogo = [],         // <- NOMBRE CORRECTO
        estadosCatalogo = [],
        insumosCatalogo = [],
    } = usePage().props;

    // ================= ESTADOS =================
    const [q, setQ] = useState(filtros.q ?? "");
    const [accion, setAccion] = useState(filtros.accion ?? "");
    const [usuario, setUsuario] = useState(filtros.usuario_id ?? "");
    const [desde, setDesde] = useState(filtros.desde ?? "");
    const [hasta, setHasta] = useState(filtros.hasta ?? "");

    // Filtros dependientes
    const [sucursal, setSucursal] = useState("");
    const [rol, setRol] = useState("");

    // Opciones dinámicas
    const [roles, setRoles] = useState([]);
    const [usuariosOpts, setUsuariosOpts] = useState([]);
    const [accionesOpts, setAccionesOpts] = useState([]);

    // ================= HELPERS =================
    const buildParams = () => {
        const p = {};
        if (q) p.q = q;
        if (accion) p.accion = accion;
        if (usuario) p.usuario_id = usuario;
        if (desde) p.desde = desde;
        if (hasta) p.hasta = hasta;
        return p;
    };

    const submitFilters = () => {
        router.get(route("auditoria.index"), buildParams(), {
            replace: true,
            preserveScroll: true,
            preserveState: true,
        });
    };

    const resetFilters = () => {
        setQ("");
        setAccion("");
        setUsuario("");
        setDesde("");
        setHasta("");

        setSucursal("");
        setRol("");
        setRoles([]);
        setUsuariosOpts([]);
        setAccionesOpts([]);

        router.get(route("auditoria.index"), {}, { replace: true });
    };

    // =========== AJAX: Roles cuando cambia sucursal =============
    useEffect(() => {
        setRol("");
        setUsuario("");
        setAccion("");
        setRoles([]);
        setUsuariosOpts([]);
        setAccionesOpts([]);

        if (!sucursal) return;

        fetch(route("auditoria.opciones.roles", { sucursal_id: sucursal }))
            .then((res) => res.json())
            .then((data) => setRoles(data || []));
    }, [sucursal]);

    // ========== AJAX: Usuarios cuando cambia rol ==========
    useEffect(() => {
        setUsuario("");
        setAccion("");
        setUsuariosOpts([]);
        setAccionesOpts([]);

        if (!sucursal || !rol) return;

        fetch(route("auditoria.opciones.usuarios", {
            sucursal_id: sucursal,
            rol_id: rol,
        }))
            .then((res) => res.json())
            .then((data) => setUsuariosOpts(data || []));
    }, [sucursal, rol]);

    // ========== AJAX: Acciones cuando cambia usuario ==========
    useEffect(() => {
        setAccion("");
        setAccionesOpts([]);

        if (!usuario) return;

        fetch(route("auditoria.opciones.acciones", { usuario_id: usuario }))
            .then((res) => res.json())
            .then((data) => setAccionesOpts(data || []));
    }, [usuario]);

    // ================= RENDER =================
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Auditoría del Sistema" />
            <SimpleNav />

            <div className="mx-auto mt-7 max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow">
                    <h1 className="text-2xl font-semibold mb-6">Auditoría del Sistema</h1>

                    {/* ================= FILTROS ================= */}
                    <Paper sx={{ p: 3, borderRadius: "18px", mb: 4 }} elevation={3}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                            <Grid container spacing={3} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Buscar"
                                        variant="outlined"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-input:focus": {
                                                outline: "none !important",
                                                boxShadow: "none !important",
                                            }
                                        }}
                                    />

                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <DatePicker
                                        label="Fecha desde"
                                        value={desde || null}
                                        onChange={(val) =>
                                            setDesde(val?.format("YYYY-MM-DD") || "")
                                        }
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <DatePicker
                                        label="Fecha hasta"
                                        value={hasta || null}
                                        onChange={(val) =>
                                            setHasta(val?.format("YYYY-MM-DD") || "")
                                        }
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={3} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Sucursal</InputLabel>
                                        <Select
                                            value={sucursal}
                                            onChange={(e) => setSucursal(e.target.value)}
                                            label="Sucursal"
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            {sucursales.map((s) => (
                                                <MenuItem key={s.id} value={s.id}>
                                                    {s.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Rol</InputLabel>
                                        <Select
                                            value={rol}
                                            onChange={(e) => setRol(e.target.value)}
                                            label="Rol"
                                            disabled={!sucursal}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {roles.map((r) => (
                                                <MenuItem key={r.id} value={r.id}>
                                                    {r.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Usuario</InputLabel>
                                        <Select
                                            value={usuario}
                                            onChange={(e) => setUsuario(e.target.value)}
                                            label="Usuario"
                                            disabled={!sucursal || !rol}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {usuariosOpts.map((u) => (
                                                <MenuItem key={u.id} value={u.id}>
                                                    {u.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Acción</InputLabel>
                                        <Select
                                            value={accion}
                                            onChange={(e) => setAccion(e.target.value)}
                                            label="Acción"
                                            disabled={!usuario}
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            {accionesOpts.map((a) => (
                                                <MenuItem key={a} value={a}>
                                                    {getActionLabel(a)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<FilterAltIcon />}
                                        onClick={submitFilters}
                                        sx={{ height: "48px" }}
                                    >
                                        FILTRAR
                                    </Button>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<ClearAllIcon />}
                                        onClick={resetFilters}
                                        sx={{ height: "48px" }}
                                    >
                                        LIMPIAR
                                    </Button>
                                </Grid>
                            </Grid>
                        </LocalizationProvider>
                    </Paper>

                    {/* ================= TABLA ================= */}
                    <AuditTable
                        logs={logs}
                        rolesCatalogo={rolesCatalogo}
                        usuariosCatalogo={usuariosCatalogo}
                        sucursalesCatalogo={sucCatalogo}
                        estadosCatalogo={estadosCatalogo}
                        insumosCatalogo={insumosCatalogo}
                    />

                    {/* ================= PAGINACIÓN ================= */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500">
                            Mostrando {logs.from}–{logs.to} de {logs.total}
                        </div>

                        <div className="flex gap-2">
                            {logs.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || "#"}
                                    preserveScroll
                                    preserveState
                                    className={`px-3 py-1 rounded-lg border ${
                                        link.active
                                            ? "bg-blue-600 text-white"
                                            : "bg-white hover:bg-gray-50"
                                    } ${!link.url ? "pointer-events-none opacity-50" : ""}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
