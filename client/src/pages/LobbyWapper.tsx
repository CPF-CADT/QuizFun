import { useLocation, Navigate } from "react-router-dom";
import LobbyPage from "./LobbyPage";

const LobbyPageWrapper = () => {
  const location = useLocation();
  const state = location.state as {
    gamePin: string;
    players: { id: string; name: string; isHost?: boolean }[];
    hostName: string;
  };

  if (!state) {
    return <Navigate to="/" replace />;
  }

  return (
    <LobbyPage
      gamePin={state.gamePin}
      players={state.players}
      hostName={state.hostName}
    />
  );
};

export default LobbyPageWrapper;
