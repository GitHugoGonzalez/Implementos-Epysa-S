import * as React from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Collapse, Box, Typography
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { translateAuditChanges } from "@/Utils/auditTranslate";

function Row({ row, rolesCatalogo, sucursalesCatalogo }) {
    const [open, setOpen] = React.useState(false);

    const cambios = translateAuditChanges(
        row.valores_antes,
        row.valores_despues,
        rolesCatalogo,
        sucursalesCatalogo
    );

    return (
        <>
            <TableRow hover>
                <TableCell padding="checkbox">
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                <TableCell>{row.usuario_nombre}</TableCell>
                <TableCell>{row.sucursal_nombre ?? "—"}</TableCell>
                <TableCell>{row.accion}</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="h6">Cambios realizados</Typography>

                            <Table size="small">
                                <TableBody>
                                    {cambios.length === 0 && (
                                        <TableRow>
                                            <TableCell>No hubo modificaciones relevantes.</TableCell>
                                        </TableRow>
                                    )}

                                    {cambios.map((c, i) => (
                                        <TableRow key={i}>
                                            <TableCell width="25%" sx={{ fontWeight: "bold" }}>
                                                {c.campo}
                                            </TableCell>
                                            <TableCell width="35%" sx={{ color: "gray" }}>
                                                {c.antes}
                                            </TableCell>
                                            <TableCell width="5%" align="center">→</TableCell>
                                            <TableCell width="35%" sx={{ fontWeight: "bold" }}>
                                                {c.despues}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function AuditTable({ logs, rolesCatalogo, sucursalesCatalogo }) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Fecha</TableCell>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Sucursal</TableCell>
                        <TableCell>Acción</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {logs.data.map((l) => (
                        <Row
                            key={l.id_audit}
                            row={l}
                            rolesCatalogo={rolesCatalogo}
                            sucursalesCatalogo={sucursalesCatalogo}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
