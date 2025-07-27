import fs from "fs";
import path from "path";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { io } from "../server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CIVS_POR_JUGADOR_PATH = join(
  __dirname,
  "..",
  "data",
  "civs_por_jugador.json"
);

const JUGADORES_PATH = join(__dirname, "..", "data", "jugadores.json");
// const CIVS_POR_JUGADOR_PATH = join(__dirname, '..', 'data', 'civs_por_jugador.json');

const civsIniciales = [
  "Magiares",
  "Mayas",
  "Chinos",
  "Búlgaros",
  "Bizantinos",
  "Britanos",
  "Celtas",
  "Francos",
  "Godos",
  "Hunos",
  "Italianos",
  "Japoneses",
  "Koreanos",
  "Lituanos",
  "Malianos",
  "Mongoles",
  "Persas",
  "Polacos",
  "Portugueses",
  "Sarracenos",
  "Sicilianos",
  "Tártaros",
  "Teutones",
  "Turcos",
  "Vikingos",
  "Vietnamitas",
  "Bengalíes",
  "Dravidianos",
  "Gurjaras",
  "Bérberes",
  "Etíopes",
  "Incas",
  "Khmer",
  "Malayos",
  "Tailandeses",
  "Bohemios",
  "Romanos",
  "Georgianos",
  "Armenios",
  "Eslavos",
  "Aztecas",
];

// Leer JSON seguro, devuelve valorPorDefecto si falla o no existe
function leerJSONSeguro(ruta, valorPorDefecto) {
  try {
    if (!fs.existsSync(ruta)) {
      fs.writeFileSync(ruta, JSON.stringify(valorPorDefecto, null, 2));
      return valorPorDefecto;
    }
    const contenido = fs.readFileSync(ruta, "utf-8");
    if (!contenido.trim()) return valorPorDefecto;
    return JSON.parse(contenido);
  } catch (error) {
    console.error(`Error leyendo ${ruta}:`, error.message);
    return valorPorDefecto;
  }
}

function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
}

export const crearJugador = (req, res) => {
  const { jugador } = req.body;
  if (!jugador)
    return res.status(400).json({ error: "Falta el nombre del jugador." });

  const civsPorJugador = leerJSONSeguro(CIVS_POR_JUGADOR_PATH, {});

  if (civsPorJugador[jugador]) {
    return res.status(400).json({ error: "El jugador ya existe." });
  }

  civsPorJugador[jugador] = [...civsIniciales];
  guardarJSON(CIVS_POR_JUGADOR_PATH, civsPorJugador);

  // ✅ Emitir evento de actualización
  io.emit("jugadores_actualizados", Object.keys(civsPorJugador));

  return res.json({
    message: `Jugador '${jugador}' creado correctamente.`,
    jugador,
    disponibles: civsPorJugador[jugador],
    usadas: [],
  });
};

// Inicializa lista para un jugador si no existe
function inicializarJugador(civsPorJugador, jugador) {
  if (!civsPorJugador[jugador]) {
    civsPorJugador[jugador] = [...civsIniciales];
  }
}

export const asignarCivJugador = (req, res) => {
  const { jugador } = req.body;
  if (!jugador)
    return res.status(400).json({ error: "Falta el nombre del jugador." });

  const civsPorJugador = leerJSONSeguro(CIVS_POR_JUGADOR_PATH, {});

  if (!civsPorJugador[jugador]) {
    return res
      .status(404)
      .json({ error: "El jugador no existe. Primero crealo." });
  }

  const civsJugador = civsPorJugador[jugador];
  if (civsJugador.length === 0) {
    return res.status(400).json({
      error: "No quedan civilizaciones disponibles para este jugador.",
    });
  }

  const index = Math.floor(Math.random() * civsJugador.length);
  const civ = civsJugador.splice(index, 1)[0];

  const disponibles = civsPorJugador[jugador];
  const usadas = civsIniciales.filter((civ) => !disponibles.includes(civ));
  const nuevoEstado = { disponibles, usadas };

  guardarJSON(CIVS_POR_JUGADOR_PATH, civsPorJugador);
  io.emit("estado_actualizado", { jugador, estado: nuevoEstado });

  return res.json({ jugador, civ });
};

// Endpoint para resetear la lista de un jugador
export const resetearJugador = (req, res) => {
  const { jugador } = req.body;
  if (!jugador)
    return res.status(400).json({ error: "Falta el nombre del jugador." });

  const civsPorJugador = leerJSONSeguro(CIVS_POR_JUGADOR_PATH, {});
  civsPorJugador[jugador] = [...civsIniciales];

  const disponibles = civsPorJugador[jugador];
  const usadas = civsIniciales.filter((civ) => !disponibles.includes(civ));
  const nuevoEstado = { disponibles, usadas };

  guardarJSON(CIVS_POR_JUGADOR_PATH, civsPorJugador);
  io.emit("estado_actualizado", { jugador, estado: nuevoEstado });

  return res.json({ jugador, message: "Lista de civilizaciones reseteada." });
};

// En civController.js
export const obtenerEstadoJugador = (req, res) => {
  const { jugador } = req.params;

  if (!jugador)
    return res.status(400).json({ error: "Falta el nombre del jugador." });

  const civsPorJugador = leerJSONSeguro(CIVS_POR_JUGADOR_PATH, {});

  if (!civsPorJugador[jugador]) {
    // Si no existe, inicializamos y guardamos
    civsPorJugador[jugador] = [...civsIniciales];
    guardarJSON(CIVS_POR_JUGADOR_PATH, civsPorJugador);
  }

  // Civilizaciones usadas = las que no están en disponibles
  const usadas = civsIniciales.filter(
    (civ) => !civsPorJugador[jugador].includes(civ)
  );

  return res.json({
    jugador,
    disponibles: civsPorJugador[jugador],
    usadas,
  });
};

// Función auxiliar para cargar los jugadores dinámicamente
function obtenerJugadores() {
  if (!fs.existsSync(CIVS_POR_JUGADOR_PATH)) {
    return [];
  }
  const data = fs.readFileSync(CIVS_POR_JUGADOR_PATH, "utf-8");
  const civsPorJugador = JSON.parse(data);
  return Object.keys(civsPorJugador); // devuelve un array de jugadores
}

export const listarJugadores = (req, res) => {
  try {
    const jugadores = obtenerJugadores();
    res.json({ jugadores });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los jugadores." });
  }
};

// 🚨 NUEVO: Controlador para eliminar un jugador
export function eliminarJugador(req, res) {
  const { nombre } = req.params;

  try {
    const data = JSON.parse(fs.readFileSync(CIVS_POR_JUGADOR_PATH, "utf-8"));

    if (!data[nombre]) {
      return res
        .status(404)
        .json({ error: `El jugador '${nombre}' no existe.` });
    }

    delete data[nombre];

    fs.writeFileSync(CIVS_POR_JUGADOR_PATH, JSON.stringify(data, null, 2));
    // ✅ Emitir evento de actualización
    io.emit("jugadores_actualizados", Object.keys(data)); 
    res.json({ message: `Jugador '${nombre}' eliminado correctamente.` });
  } catch (error) {
    console.error("Error al eliminar jugador:", error);
    res.status(500).json({ error: "Error al eliminar jugador." });
  }
}


export const agregarCivManualmente = (req, res) => {
  const { jugador, civ } = req.body;

  if (!jugador || !civ) {
    return res.status(400).json({ error: "Falta jugador o civilización." });
  }

  const civsPorJugador = leerJSONSeguro(CIVS_POR_JUGADOR_PATH, {});

  if (!civsPorJugador[jugador]) {
    return res.status(404).json({ error: "El jugador no existe." });
  }

  // Si la civ no está disponible, error o ignorar
  if (!civsPorJugador[jugador].includes(civ)) {
    return res.status(400).json({ error: "La civilización no está disponible para este jugador." });
  }

  // Quitar civ de disponibles
  civsPorJugador[jugador] = civsPorJugador[jugador].filter((c) => c !== civ);

  guardarJSON(CIVS_POR_JUGADOR_PATH, civsPorJugador);

  const disponibles = civsPorJugador[jugador];
  const usadas = civsIniciales.filter((c) => !disponibles.includes(c));
  const nuevoEstado = { disponibles, usadas };

  io.emit("estado_actualizado", { jugador, estado: nuevoEstado });

  return res.json({ jugador, nuevoEstado });
};
