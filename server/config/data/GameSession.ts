interface Participants {
  user_id: string;
  user_name: string;
  user_profile: string;
}

interface SessionData {
  game_id: string;
  quizId: string;
  hostId: string;
  participants?: Participants[];
}

export class GameSessionManager {
  static waitLobby = new Map<number, SessionData>();
  static currentGamePlay = new Map<number, SessionData>();

  static addSession(code: number, session: SessionData): void {
    GameSessionManager.waitLobby.set(code, session);
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

