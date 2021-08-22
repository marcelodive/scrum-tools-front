import { PokerUser } from "./poker-user";

export interface PokerRoom {
    id: string,
    admin: string,
    pokerUsers: PokerUser[],
    finishedVoting?: boolean
}
