import { useState } from "react";
import { MATCHES, type RoomId } from "../types/chat";

interface HomeProps {
    onJoin: (roomId: RoomId, username: string) => void;
}

function randomUsername(): string {
    const n = Math.floor(Math.random() * 900) + 100;
    return `Fan_${n}`;
}

export default function Home({ onJoin }: HomeProps) {
    const [username, setUsername] = useState(randomUsername());

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-8 px-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">WatchParty</h1>
                <p className="text-slate-400 mt-1">Elegí un partido y sumate a la charla en vivo</p>
            </div>

            <div className="w-full max-w-sm">
                <label className="block text-sm text-slate-400 mb-1">Tu nombre de usuario</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Fan_123"
                />
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
                {MATCHES.map((match) => (
                    <button
                        key={match.id}
                        onClick={() => onJoin(match.id, username.trim() || randomUsername())}
                        className="w-full text-left rounded-xl bg-slate-900 border border-slate-800 px-4 py-4 hover:border-emerald-500 hover:bg-slate-800 transition-colors"
                    >
            <span className="block text-xs uppercase tracking-wide text-emerald-400 mb-1">
              Sala en vivo
            </span>
                        <span className="block text-lg font-semibold">{match.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}