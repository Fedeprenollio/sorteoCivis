import mongoose from "mongoose";

const civiAsignadaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, enum: ["manual", "sorteo"], required: true },
});

const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  disponibles: { type: [String], default: [] },
  civisAsignadas: { type: [civiAsignadaSchema], default: [] },
});

export default mongoose.model("Jugador", jugadorSchema);
