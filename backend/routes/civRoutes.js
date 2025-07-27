import express from 'express';
import { agregarCivManualmente, asignarCivJugador, crearJugador, eliminarJugador, listarJugadores, obtenerEstadoJugador, resetearJugador } from '../controllers/civController.js';

const router = express.Router();

// Ruta para asignar una civilización a un jugador (POST)
router.post('/asignar', asignarCivJugador);
router.post('/crear', crearJugador);

// Ruta para resetear la lista de civilizaciones de un jugador (POST)
router.post('/resetear', resetearJugador);

router.get('/estado/:jugador', obtenerEstadoJugador);
router.get("/jugadores", listarJugadores);
router.delete("/jugadores/:nombre", eliminarJugador);
router.post("/agregar-manual", agregarCivManualmente);
export default router;
