/**
 * The game is accepting new bets to be placed for the next round.
 * This is usually a five second window
 */
export const GAME_STATE_STARTING = 1;
/**
 * The game round is in progress. Users with active bets can cashout during this period
 */
export const GAME_STATE_IN_PROGRESS = 3;
/**
 * Transition period after game bust and before the next round starts
 */
export const GAME_STATE_ENDED = 4;

export type GameState =
  typeof GAME_STATE_STARTING |
  typeof GAME_STATE_IN_PROGRESS |
  typeof GAME_STATE_ENDED;

/**
 * The user does not have an active bet
 *
 * Available Action:
 *   In this state, the user can place a bet. This action would move them to either QUEUED or PLACING states.
 */
export const BET_STATE_IDLE = 1;
/**
 * This is an intermediate step that happens when the user places a bet before the next round has started.
 * In this state, we are simply sitting waiting for the server to start accepting wagers for the next round before we send the request to the backend
 *
 * Available Action:
 *  In this state, the user, can cancel the bet if they wish. This action would take them back to the IDLE state
 */
export const BET_STATE_QUEUED = 2;
/**
 * We have sent a request to the backend to place a bet.
 * A user will continue being in this state until the 5 seconds window to place bets elapses, then they move to playing state.
 *
 * Available Action:
 *  In this state, no actions are available to the user. The user will automatically be moved to the PLAYING state once the window elapses
 */
export const BET_STATE_PLACING = 3;
/**
 * The bet was placed successfully and is active. i.e, the game hasn't busted, and we haven't cashed out
 *
 * Available Action:
 *  In this state, the user can cashout. This action would take the user to CASHING_OUT state
 */
export const BET_STATE_PLAYING = 4;
/**
 * This is a very short lived state that happens once we send a cashout request to the backend and before we receive a response
 *
 * Available Action:
 *  In this state, no actions are available to the user. The user will automatically be moved to the IDLE state after the cashout succeeds
 *
 */
export const BET_STATE_CASHING_OUT = 5;


export type BetState =
  typeof BET_STATE_IDLE |
  typeof BET_STATE_QUEUED |
  typeof BET_STATE_PLACING |
  typeof BET_STATE_PLAYING |
  typeof BET_STATE_CASHING_OUT;


export type HTTPDate = string | Date | number;

/**
 * Represents a user's bet for a game round
 */
export interface HTTPPlay {
  user_id: number
  xid: number
  game_id: number
  idx: 0 | 1
  currency: string
  bet: number // stake
  username: string
  crash: number // crash point
  created_at: HTTPDate
  /**
   * The point at which the user cashed out.
   * This is only populated if the user won. i.e., cashed out before the game busted.
   */
  stopped_at?: number
}

export type IPlay = Omit<HTTPPlay, "crash">;

export interface IGameHistoryItem {
  id: number;
  hash: string;
  crash: number;
}

/**
 * Payload when placing a bet
 */
export interface IBetPayload {
  currency: string; // KES
  amount: number;
  autoCashout: number;
  idx: 0 | 1;
}


