import { BallotUser } from "./ballot-user";

export interface BallotRoom {
    id: string,
    admin: string,
    ballotUsers: BallotUser[],
    options: string[],
    startedVoting?:boolean,
    finishedVoting?: boolean
}