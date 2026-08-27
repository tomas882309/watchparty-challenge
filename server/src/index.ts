import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { MATCHES } from "./types/chat";
import type { RoomId, ChatMessage, ClientMessage, ServerMessage } from "./types/chat";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 8080;
const VALID_ROOM_IDS = new Set(MATCHES.map((m) => m.id));
const MAX_HISTORY = 50;

interface RoomClient {
    ws: WebSocket;
    username: string;
}

const rooms = new Map<RoomId, Set<RoomClient>>();
const roomHistory = new Map<RoomId, ChatMessage[]>();

function getRoomClients(roomId: RoomId): Set<RoomClient> {
    let clients = rooms.get(roomId);
    if (!clients) {
        clients = new Set();
        rooms.set(roomId, clients);
    }
    return clients;
}

function getRoomHistory(roomId: RoomId): ChatMessage[] {
    let history = roomHistory.get(roomId);
    if (!history) {
        history = [];
        roomHistory.set(roomId, history);
    }
    return history;
}

function send(ws: WebSocket, message: ServerMessage) {
    ws.send(JSON.stringify(message));
}

function broadcast(roomId: RoomId, message: ServerMessage) {
    const payload = JSON.stringify(message);
    for (const client of getRoomClients(roomId)) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(payload);
        }
    }
}

function isClientMessage(data: unknown): data is ClientMessage {
    return (
        typeof data === "object" &&
        data !== null &&
        (data as { type?: unknown }).type === "SEND_MESSAGE"
    );
}

wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const roomParam = url.searchParams.get("room");
    const usernameParam = url.searchParams.get("username");

    if (!roomParam || !VALID_ROOM_IDS.has(roomParam as RoomId)) {
        send(ws, { type: "ERROR", payload: { message: "Sala inválida" } });
        ws.close();
        return;
    }

    const roomId = roomParam as RoomId;
    const username = usernameParam?.trim() || `Fan_${Math.floor(Math.random() * 900) + 100}`;

    const client: RoomClient = { ws, username };
    getRoomClients(roomId).add(client);

    send(ws, {
        type: "ROOM_JOINED",
        payload: { roomId, history: getRoomHistory(roomId) },
    });

    ws.on("message", (raw) => {
        let data: unknown;
        try {
            data = JSON.parse(raw.toString());
        } catch {
            return;
        }

        if (!isClientMessage(data)) return;

        const text = data.payload.text?.trim();
        if (!text) return;

        const chatMessage: ChatMessage = {
            id: randomUUID(),
            roomId,
            username,
            text: text.slice(0, 500),
            timestamp: Date.now(),
        };

        const history = getRoomHistory(roomId);
        history.push(chatMessage);
        if (history.length > MAX_HISTORY) history.shift();

        broadcast(roomId, { type: "NEW_MESSAGE", payload: chatMessage });
    });

    ws.on("close", () => {
        getRoomClients(roomId).delete(client);
    });
});

app.get("/", (_req, res) => {
    res.send("WatchParty chat server running");
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});