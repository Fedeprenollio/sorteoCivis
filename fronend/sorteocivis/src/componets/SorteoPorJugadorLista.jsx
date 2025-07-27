import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Stack,
  Typography,
  Paper,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { io } from "socket.io-client";

export default function SorteoPorJugadorLista({
  jugadores,
  setJugadores,
  estadoJugadores,
  setEstadoJugadores,
  sortear,
  mensaje,
  setMensaje,
}) {
  const cargarJugadoresYEstados = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/civs/jugadores`
      );
      const jugadoresCargados = data?.jugadores;
      setJugadores(jugadoresCargados);

      const promesas = jugadoresCargados.map((jugador) =>
        axios.get(`${import.meta.env.VITE_API_URL}/api/civs/estado/${jugador}`)
      );

      const resultados = await Promise.all(promesas);
      const estados = {};
      resultados.forEach(({ data }) => {
        estados[data?.jugador] = data;
      });
      setEstadoJugadores(estados);
    } catch (error) {
      console.error(error);
      setMensaje("Error al cargar jugadores o sus estados.");
    }
  };

  // 1. Función para agregar manualmente una civ al jugador
  const agregarCivManual = async (jugador, civ) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/civs/agregar-manual`, {
        jugador,
        civ,
      });
      setMensaje(
        `Civilización ${civ} agregada manualmente a usadas para ${jugador}`
      );
      // No actualizamos localmente porque el socket actualizará automáticamente el estado
    } catch (error) {
      setMensaje(
        error.response?.data?.error ||
          "Error al agregar civilización manualmente."
      );
    }
  };

  useEffect(() => {
    cargarJugadoresYEstados();

    // // Crear socket solo una vez
    // socketRef.current = io("http://localhost:4000");

    // socketRef.current.on("jugadores_actualizados", (nuevosJugadores) => {
    //   setJugadores(nuevosJugadores);
    // });

    // socketRef.current.on("estado_actualizado", ({ jugador, estado }) => {
    //   setEstadoJugadores((prev) => ({
    //     ...prev,
    //     [jugador]: estado,
    //   }));
    // });

    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.off("jugadores_actualizados");
    //     socketRef.current.off("estado_actualizado");
    //     socketRef.current.disconnect();
    //   }
    // };
  }, []);

  // const sortear = async (jugador) => {
  //   try {
  //     const { data } = await axios.post(
  //       "http://localhost:4000/api/civs/asignar",
  //       { jugador }
  //     );
  //     setMensaje(`Sorteo realizado para ${jugador}`);
  //     setEstadoJugadores((prev) => ({
  //       ...prev,
  //       [jugador]: {
  //         ...prev[jugador],
  //         disponibles: prev[jugador].disponibles.filter((c) => c !== data.civ),
  //         usadas: [...prev[jugador].usadas, data.civ],
  //       },
  //     }));
  //   } catch (error) {
  //     setMensaje(
  //       error.response?.data?.error || "Error al sortear la civilización."
  //     );
  //   }
  // };

  const resetear = async (jugador) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/civs/resetear`, { jugador });
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/civs/estado/${jugador}`
      );
      setEstadoJugadores((prev) => ({
        ...prev,
        [jugador]: data,
      }));
      setMensaje(`Lista reseteada para ${jugador}`);
    } catch (error) {
      setMensaje("Error al resetear la lista del jugador.");
    }
  };

  const eliminarJugador = async (jugador) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/civs/jugadores/${jugador}`);
      setJugadores((prev) => prev.filter((j) => j !== jugador));
      setEstadoJugadores((prev) => {
        const nuevoEstado = { ...prev };
        delete nuevoEstado[jugador];
        return nuevoEstado;
      });
      setMensaje(`Jugador ${jugador} eliminado.`);
    } catch (error) {
      setMensaje("Error al eliminar el jugador.");
      console.error(error);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Civilizaciones por Jugador
      </Typography>

      <Stack spacing={3}>
        {jugadores?.map((jugador) => {
          const estado = estadoJugadores[jugador];

          return (
            <Paper
              key={jugador}
              sx={{ p: 3, border: "1px solid #ccc", borderRadius: 2 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{jugador}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => sortear(jugador)}
                    disabled={!estado || estado.disponibles.length === 0}
                  >
                    Sortear
                  </Button>
                  <IconButton
                    onClick={() => eliminarJugador(jugador)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Disponibles:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} my={1}>
                  {estado?.disponibles?.length ? (
                    estado.disponibles.map((civ) => (
                      <Chip
                        key={civ}
                        label={civ}
                        color="primary"
                        variant="outlined"
                        onClick={() => agregarCivManual(jugador, civ)}
                        sx={{ cursor: "pointer" }}
                        title="Click para agregar a usadas"
                      />
                    ))
                  ) : (
                    <Typography variant="body2">Ninguna</Typography>
                  )}
                </Stack>

                <Typography variant="subtitle1" color="text.secondary" mt={2}>
                  Usadas:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} my={1}>
                  {estado?.usadas?.length ? (
                    estado.usadas.map((civ) => (
                      <Chip
                        key={civ}
                        label={civ}
                        color="default"
                        variant="filled"
                      />
                    ))
                  ) : (
                    <Typography variant="body2">Ninguna</Typography>
                  )}
                </Stack>
              </Box>

              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => resetear(jugador)}
                >
                  Resetear
                </Button>
              </Stack>
            </Paper>
          );
        })}

        {mensaje && (
          <>
            <Divider />
            <Typography color="primary">{mensaje}</Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
}
