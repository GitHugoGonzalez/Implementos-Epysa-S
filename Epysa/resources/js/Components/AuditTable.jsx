import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Collapse,
    Box,
    Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import AuditDiffTable from "@/Components/AuditDiffTable";

// ⬅️ Importamos el diccionario
import { getActionLabel } from "@/Utils/AuditLabels";

function Row({ row, catalogs }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            {/* FILA PRINCIPAL */}
            <TableRow hover>
                <TableCell padding="checkbox">
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell>
                    {new Date(row.created_at).toLocaleString()}
                </TableCell>

                <TableCell>
                    {row.usuario_nombre ?? "—"}
                </TableCell>

                {/* ⬇️ Aquí aplicamos la traducción */}
                <TableCell>
                    {getActionLabel(row.accion) || "—"}
                </TableCell>
            </TableRow>

            {/* FILA EXPANDIBLE */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Detalle del cambio
                            </Typography>

                            <AuditDiffTable
                                before={row.valores_antes || {}}
                                after={row.valores_despues || {}}
                                catalogs={catalogs}
                            />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function AuditTable({
    logs,
    rolesCatalogo = [],
    usuariosCatalogo = [],
    sucursalesCatalogo = [],
    estadosCatalogo = [],
    insumosCatalogo = [],
}) {
    // agrupamos los catálogos en un solo objeto
    const catalogs = {
        rolesCatalogo,
        usuariosCatalogo,
        sucursalesCatalogo,
        estadosCatalogo,
        insumosCatalogo,
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Fecha</TableCell>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Acción</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {logs.data.map((l) => (
                        <Row key={l.id_audit} row={l} catalogs={catalogs} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
