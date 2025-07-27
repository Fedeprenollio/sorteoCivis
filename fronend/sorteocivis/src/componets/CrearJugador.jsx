import React, { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import axios from "axios";

export default function CrearJugador({ onJugadorCreado }) {
  const [nuevoJugador, setNuevoJugador] = useState("");
  const [mensaje, setMensaje] = useState("");

  const crearJugador = async () => {
    const jugador = nuevoJugador.trim();
    if (!jugador) {
      setMensaje("Por favor ingresa un nombre válido.");
      return;
    }

    try {
      // Llamar solo a la ruta que crea jugador, sin sortear
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/civs/crear`,
        {
          jugador,
        }
      );

      setMensaje(data.message || `Jugador "${jugador}" creado correctamente.`);
      setNuevoJugador("");
      if (onJugadorCreado) {
        onJugadorCreado({
          nombre: data.jugador,
          disponibles: data.disponibles,
          usadas: data.usadas,
        });
      }
    } catch (error) {
      setMensaje(error.response?.data?.error || "Error al crear al jugador.");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h6" mb={2}>
        Crear nuevo jugador
      </Typography>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Nombre del jugador"
          value={nuevoJugador}
          onChange={(e) => setNuevoJugador(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={crearJugador}>
          Crear
        </Button>
      </Stack>

      {mensaje && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography color="primary">{mensaje}</Typography>
        </>
      )}
    </Paper>
  );
}
