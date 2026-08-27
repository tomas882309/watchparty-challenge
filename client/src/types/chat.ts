export type RoomId = "boca-river" | "argentina-brasil";

export interface Match {
    id: RoomId;
    label: string;
}

export const MATCHES: Match[] = [
    { id: "boca-river", label: "Boca vs. River" },
    { id: "argentina-brasil", label: "Argentina vs. Brasil" },
];

export interface ChatMessage {
    id: string;
    roomId: RoomId;
    username: string;
    text: string;
    timestamp: number;
}

// Cliente -> Servidor
export interface ClientSendMessage {
    type: "SEND_MESSAGE";
    payload: {
        text: string;
    };
}

export type ClientMessage = ClientSendMessage;

// Servidor -> Cliente
export interface ServerRoomJoined {
    type: "ROOM_JOINED";
    payload: {
        roomId: RoomId;
        history: ChatMessage[];
    };
}

export interface ServerNewMessage {
    type: "NEW_MESSAGE";
    payload: ChatMessage;
}

export interface ServerError {
    type: "ERROR";
    payload: {
        message: string;
    };
}

export type ServerMessage = ServerRoomJoined | ServerNewMessage | ServerError;