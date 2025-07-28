import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import SorteoPorJugadorLista from "./componets/SorteoPorJugadorLista";
import CrearJugador from "./componets/CrearJugador";
import axios from "axios";

function App() {
  const [jugadores, setJugadores] = useState([]);
  const [estadoJugadores, setEstadoJugadores] = useState({});
  const socketRef = useRef(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_API_URL}`);

    socketRef.current.on("jugadores_actualizados", async (nuevosJugadores) => {
      setJugadores(nuevosJugadores);

      // Actualiza estado de jugadores en paralelo
      const estados = {};
      await Promise.all(
        nuevosJugadores.map(async (jugador) => {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/civs/estado/${jugador}`
          );
          estados[jugador] = data;
        })
      );
      setEstadoJugadores(estados);
    });

    socketRef.current.on("estado_actualizado", ({ jugador, estado }) => {
      setEstadoJugadores((prev) => ({
        ...prev,
        [jugador]: estado,
      }));
    });

    // Carga inicial
    (async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/civs/jugadores`
      );
      setJugadores(data.jugadores);

      const estadosIniciales = {};
      await Promise.all(
        data.jugadores.map(async (jugador) => {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/civs/estado/${jugador}`
          );
          estadosIniciales[jugador] = res.data;
        })
      );
      setEstadoJugadores(estadosIniciales);
    })();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);


  const sortear = async (jugador) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/civs/asignar`,
        { jugador }
      );
      setMensaje(`Sorteo realizado para ${jugador}`);
      // No hacer setEstadoJugadores acá
    } catch (error) {
      setMensaje(
        error.response?.data?.error || "Error al sortear la civilización."
      );
    }
  };

  return (
    <div>
      <h1>Sorteo AoE2</h1>
      <CrearJugador
        onJugadorCreado={async () => {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/civs/jugadores`
          );
          setJugadores(data.jugadores);
          const nuevoJugador = data.jugadores[data.jugadores.length - 1];
          const estadoRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/civs/estado/${nuevoJugador}`
          );
          setEstadoJugadores((prev) => ({
            ...prev,
            [nuevoJugador]: estadoRes.data,
          }));
        }}
      />
      <SorteoPorJugadorLista
        jugadores={jugadores}
        estadoJugadores={estadoJugadores}
        setJugadores={setJugadores}
        setEstadoJugadores={setEstadoJugadores}
        sortear={sortear} // <-- paso sortear por prop
        mensaje={mensaje}
        setMensaje={setMensaje}
      />
    </div>
  );
}

export default App;
