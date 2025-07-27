const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');
const filePath = path.join(__dirname, '../models/civs.json');

async function sortearCiv(jugador) {
  const data = await readJSON(filePath);
  const disponibles = data.disponibles;

  if (disponibles.length === 0) {
    throw new Error('No hay más civs disponibles.');
  }

  const randomIndex = Math.floor(Math.random() * disponibles.length);
  const civ = disponibles[randomIndex];

  // Eliminar la civ sorteada
  disponibles.splice(randomIndex, 1);

  data.historial.push({ jugador, civ });
  await writeJSON(filePath, data);

  return civ;
}

module.exports = { sortearCiv };
