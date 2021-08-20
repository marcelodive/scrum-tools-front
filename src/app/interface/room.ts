import { PokerUser } from "./poker-user";

export interface Room {
    id: string,
    admin: string,
    pokerUsers: PokerUser[],
    finishedVoting?: boolean
}
