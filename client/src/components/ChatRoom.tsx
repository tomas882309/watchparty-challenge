import { useEffect, useRef, useState } from "react";
import type { Match } from "../types/chat";
import { useChatSocket } from "../hooks/useChatSocket";

interface ChatRoomProps {
    match: Match;
    username: string;
    onLeave: () => void;
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoom({ match, username, onLeave }: ChatRoomProps) {
    const { messages, connected, sendMessage } = useChatSocket(match.id, username);
    const [draft, setDraft] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!connected || !draft.trim()) return;
        sendMessage(draft.trim());
        setDraft("");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-xs text-emerald-400 uppercase tracking-wide">
                        Sala en vivo {connected ? "" : "· conectando..."}
                    </p>
                    <h1 className="text-lg font-semibold">{match.label}</h1>
                </div>
                <button
                    onClick={onLeave}
                    className="text-sm text-slate-400 hover:text-red-400 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-red-400 transition-colors"
                >
                    Salir de la sala
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.length === 0 && (
                    <p className="text-slate-500 text-sm text-center mt-8">
                        Todavía no hay comentarios. ¡Sé el primero!
                    </p>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className="max-w-md">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-emerald-400">{msg.username}</span>
                            <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-slate-200">{msg.text}</p>
                    </div>
                ))}
                <div ref={bottomRef} />
            </main>

            <footer className="border-t border-slate-800 px-4 py-3 flex gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={connected ? `Comentando como ${username}` : "Conectando..."}
                    disabled={!connected}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!connected}
                    className="rounded-lg bg-emerald-500 text-slate-950 font-semibold px-4 py-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Enviar
                </button>
            </footer>
        </div>
    );
}