import { useEffect, useState } from "react";

const ws = new WebSocket("ws://localhost:8080");

export default function SorteoView() {
  const [mensajes, setMensajes] = useState([]);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    ws.onmessage = (event) => {
      setMensajes((prev) => [...prev, event.data]);
    };
  }, []);

  const sortear = () => {
    ws.send(JSON.stringify({ type: "sortear", name: nombre }));
  };

  return (
    <div>
      <input
        type="text"
        value={nombre}
        placeholder="Tu nombre"
        onChange={(e) => setNombre(e.target.value)}
      />
      <button onClick={sortear}>Sortear civ</button>

      <ul>
        {mensajes.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
