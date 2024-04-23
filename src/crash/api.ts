import {ListQuery, UserIdOrMe} from "../../utils/types";
import {HTTPDate, HTTPPlay} from "./types";

type UserIdOrMe = number | "me";
type XID = number;


export interface HTTPGameAdminStats {
  stake_count: number
  stake_total: number
  house_net: number
}

/**
 * Represents a game round
 */
export interface HTTPGame {
  id: number
  hash: string
  crash: number
  created_at: HTTPDate
  /**
   * A list of bets placed
   */
  plays: Array<Omit<HTTPPlay, "crash">>

  /**
   * Admin stats
   */
  stats?: HTTPGameAdminStats
}

const base = (uid: string) => `/${uid}`;

// /aviator/bets/me/:xid
export const fetchCrashUserBet =
  (uid: string, params: { xid: XID }) =>
    client.get<HTTPPlay>(base(uid), `bets/me/:xid`, params);

export const fetchCrashUserBetList =
  (uid: string, params: UserIdOrMe & ListQuery) =>
    client.get<HTTPPlay[]>(base(uid), `bets/:user_id`, params);

export const fetchCrashRound =
  (uid: string, params: { xid: number | string, currency: string }) =>
    client.get<HTTPGame>(base(uid), `rounds/:xid`, params);
