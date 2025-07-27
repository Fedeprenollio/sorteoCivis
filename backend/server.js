import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js'; // tu app de Express

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // o poné tu dominio/frontend
  },
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Escuchar conexiones desde el frontend
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Exportar io para usarlo en los controladores
export { io };
