​export interface Participants {
  socket_id: string;
  user_id: string;
  user_name: string;
  user_profile: string;
  isOnline:boolean;
} 

export interface SessionData {
  quizId: string;
  hostId: string;
  host_socket_id: string;
  participants?: Participants[];
}

export class GameSessionManager {
  static waitLobby = new Map<number, SessionData>();
  static currentGamePlay = new Map<number, SessionData>();

  static addSession(code: number, session: SessionData): boolean {
    GameSessionManager.waitLobby.set(code, session);
    return GameSessionManager.waitLobby.has(code);
  }

  static isSessionActive(code: number): boolean {
    return GameSessionManager.waitLobby.has(code) || GameSessionManager.currentGamePlay.has(code);
  }

  static addPlayerToSession(code: number, player: Participants): void {
    const session = GameSessionManager.waitLobby.get(code);
    if (session) {
      if (!session.participants) session.participants = [];
      session.participants.push(player);
    }
  }

  static startGame(code: number): void {
    const session = GameSessionManager.waitLobby.get(code);
    if (session) {
      GameSessionManager.currentGamePlay.set(code, session);
      GameSessionManager.waitLobby.delete(code);
    }
  }

  static getSession(code: number): SessionData | undefined {
    return GameSessionManager.waitLobby.get(code) || GameSessionManager.currentGamePlay.get(code);
  }
}

