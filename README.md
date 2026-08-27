# WatchParty — Mini Chat Rooms

Challenge técnico de onboarding: salas de chat en tiempo real por partido, usando WebSockets.

## Stack

- **Client**: React + TypeScript + Vite + Tailwind CSS
- **Server**: Node.js + Express + TypeScript + `ws`

## Cómo correrlo en local

Necesitás dos terminales abiertas en paralelo (server y client corren como procesos separados).

### 1. Server (WebSocket + API)

```bash
cd server
npm install
npm run dev
```

Levanta en `http://localhost:8080`.

### 2. Client (UI)

```bash
cd client
npm install
npm run dev
```

Levanta en `http://localhost:5173`. Abrilo en el navegador.

> El client espera que el server esté corriendo en `localhost:8080` (hardcodeado en `client/src/hooks/useChatSocket.ts`).

## Cómo funciona

### Separación de salas (backend)

Cuando el client abre la conexión WebSocket, manda la sala como query param en la misma URL de conexión: `ws://localhost:8080?room=boca-river&username=Fan_482`.

El server (`server/src/index.ts`) valida esa sala contra la lista de partidos válidos (`MATCHES`, definida en `types/chat.ts`) y guarda cada conexión en un `Map<RoomId, Set<RoomClient>>` — un balde de clientes por sala. Cuando llega un mensaje nuevo, se hace *broadcast* únicamente a los clientes que están en el balde de esa sala puntual, así que un mensaje de "Boca vs. River" nunca puede llegar a "Argentina vs. Brasil" (ni viceversa). Además se guarda un historial en memoria por sala (`roomHistory`), que se envía completo apenas el usuario entra (mensaje `ROOM_JOINED`).

### Conexión y desconexión limpia (frontend)

La conexión WebSocket vive dentro de un hook custom (`client/src/hooks/useChatSocket.ts`), que la crea en un `useEffect` (nunca en el render) y usa un `useRef` para mantener la instancia sin provocar renders extra. La función de limpieza que devuelve el `useEffect` (`socket.close()`) se ejecuta automáticamente cuando el componente `ChatRoom` se desmonta —por ejemplo, al apretar "Salir de la sala" o al cambiar de sala— evitando conexiones colgadas o fugas de memoria.

Del lado del server, el evento `ws.on("close", ...)` saca a ese cliente del `Set` de su sala apenas se desconecta, así el server tampoco mantiene referencias muertas.

## Estructura

```
watchparty-challenge/
├── client/     # React + Vite + TS + Tailwind
│   └── src/
│       ├── components/   # Home.tsx, ChatRoom.tsx
│       ├── hooks/        # useChatSocket.ts
│       └── types/        # chat.ts (contrato compartido con el server)
└── server/     # Express + ws + TS
└── src/
├── index.ts       # servidor HTTP + WebSocket, lógica de salas
└── types/         # chat.ts (contrato compartido con el client)
```