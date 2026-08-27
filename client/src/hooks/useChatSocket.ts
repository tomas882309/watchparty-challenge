import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ClientMessage, RoomId, ServerMessage } from "../types/chat";

interface UseChatSocketResult {
    messages: ChatMessage[];
    connected: boolean;
    sendMessage: (text: string) => void;
}

const WS_URL = "ws://localhost:8080";

export function useChatSocket(roomId: RoomId, username: string): UseChatSocketResult {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        setMessages([]);

        const url = `${WS_URL}?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(username)}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => setConnected(true);

        socket.onmessage = (event) => {
            const data: ServerMessage = JSON.parse(event.data);

            switch (data.type) {
                case "ROOM_JOINED":
                    setMessages(data.payload.history);
                    break;
                case "NEW_MESSAGE":
                    setMessages((prev) => [...prev, data.payload]);
                    break;
                case "ERROR":
                    console.error("WebSocket error:", data.payload.message);
                    break;
            }
        };

        socket.onclose = () => setConnected(false);

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [roomId, username]);

    const sendMessage = (text: string) => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        const message: ClientMessage = {
            type: "SEND_MESSAGE",
            payload: { text },
        };

        socket.send(JSON.stringify(message));
    };

    return { messages, connected, sendMessage };
}