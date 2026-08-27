import { useState } from "react";
import Home from "./components/Home";
import ChatRoom from "./components/ChatRoom";
import { MATCHES, type RoomId } from "./types/chat";

interface Session {
  roomId: RoomId;
  username: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  if (!session) {
    return <Home onJoin={(roomId, username) => setSession({ roomId, username })} />;
  }

  const match = MATCHES.find((m) => m.id === session.roomId)!;

  return (
      <ChatRoom
          match={match}
          username={session.username}
          onLeave={() => setSession(null)}
      />
  );
}

export default App;