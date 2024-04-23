import atom, {getAtom, setAtom} from "../atoms";
import {
  BET_STATE_IDLE,
  BET_STATE_QUEUED,
  GAME_STATE_ENDED,
  GameState,
  HTTPPlay,
  IBetPayload,
  IGameHistoryItem,
  IPlay
} from "./types";

type Idx = 0 | 1;
type Dual<T> = Record<Idx, T>;

export const roundsAtom = atom<IGameHistoryItem[]>([]);
export const userBetsAtom = atom<HTTPPlay[]>([]);

/** The game state is initialized. if not, all fields are unreadable */
export const initializedAtom = atom<boolean>(false);

/**
 * Client side times:
 * if the game is pending, startTime is how long till it starts
 * if the game is running, startTime is how long its running for
 * if the game is ended, startTime is how long since the game started
 */
export const startTimeAtom = atom<number>(0);

/**
 * The state of the game
 * Possible states: IN_PROGRESS, ENDED, STARTING
 */
export const gameStateAtom = atom<GameState>(GAME_STATE_ENDED);

/** If you are currently placing a bet
 * True if the bet is queued (nextBetAmount)
 * True if the bet was sent to the server, but the server has not responded yet
 *
 * Cleared in game_started, it's possible to receive this event before receiving the response of
 */
export const betStateAtom =
  atom(createDual<BetState>(BET_STATE_IDLE), true);

/**
 * Queued bet: bet to be placed next round
 *
 * Saves the queued bet if the game is not 'game_starting',
 * cleared in 'place_bet_success' by us and 'game_started' and 'cancel bet'
 */
export const nextBetAtom =
  atom(createDual<IBetPayload | undefined>(undefined), true);


type PlayMap = Record<number, Record<number, IPlay>>;

/** Object containing the current game players and their status.
 * This is saved in game history every game crash, and cleared in game_starting.
 */
export const playMapAtom = atom<PlayMap>({});

export const playCountAtom = atom<number>(0);

type CrashAppOptions = {
  code: number;
  uid: string;
};

// code=150; uid=crash
export default function useCrashAppEffect(options: CrashAppOptions) {
  const { code, uid } = options;
  console.log(code, uid);
}


export function useBetCashout() {
  return function cashout(idx: Idx): void {
  }
}

export function useBetCreate() {
  const currency = "KES";

  return function createBet(params: Omit<IBetPayload, "currency">) {
    return true;
  };
}

export function useCancelBet() {
  return function cancelBet(idx: Idx) {
    if (getAtom(betStateAtom)[idx] !== BET_STATE_QUEUED)
      return false;

    setAtom(nextBetAtom, mergeDual(idx, undefined));
    setAtom(betStateAtom, mergeDual(idx, BET_STATE_IDLE));
    return true;
  };
}