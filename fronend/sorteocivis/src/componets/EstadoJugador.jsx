import React, { useState, useEffect } from "react";
import { TextField, Button, Stack, Typography, Paper } from "@mui/material";
import axios from "axios";

export default function EstadoJugador() {
  const [jugador, setJugador] = useState("");
  const [estado, setEstado] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const consultarEstado = async () => {
    if (!jugador.trim()) {
      setMensaje("Ingresá un nombre de jugador válido.");
      return;
    }
    try {
      const { data } = await axios.get(`http://localhost:4000/api/civs/estado/${jugador}`);
      setEstado(data);
      setMensaje("");
    } catch (error) {
      setMensaje("Error al consultar estado del jugador.");
      setEstado(null);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Stack spacing={2}>
        <TextField
          label="Nombre del jugador"
          value={jugador}
          onChange={(e) => setJugador(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={consultarEstado}>
          Consultar Estado
        </Button>

        {mensaje && <Typography color="error">{mensaje}</Typography>}

        {estado && (
          <>
            <Typography variant="h6">{estado.jugador}</Typography>
            <Typography>Disponibles: {estado.disponibles.join(", ") || "Ninguna"}</Typography>
            <Typography>Usadas: {estado.usadas.join(", ") || "Ninguna"}</Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
}
