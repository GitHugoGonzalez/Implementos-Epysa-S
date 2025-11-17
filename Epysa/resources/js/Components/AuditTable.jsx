import React from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Collapse, Box, Typography
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AuditDiff from "@/Components/AuditDiff";
import { getActionLabel } from "@/Utils/AuditLabels";

function AuditRow({ row }) {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            {/* Fila principal */}
            <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                <TableCell>{row.usuario_nombre || "—"}</TableCell>
                <TableCell>{getActionLabel(row.accion)}</TableCell>
            </TableRow>

            {/* Fila expandible */}
            <TableRow>
                <TableCell colSpan={4} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Detalle del cambio
                            </Typography>

                            <AuditDiff
                                before={row.valores_antes || {}}
                                after={row.valores_despues || {}}
                            />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function AuditTable({ logs }) {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
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
                    {logs.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                No hay registros de auditoría.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.data.map((row) => (
                            <AuditRow key={row.id_audit} row={row} />
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
