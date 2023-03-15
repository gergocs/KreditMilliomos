import {StatusCodes} from "./StatusCodes";
import Game from "./game";

class RunningGameStorage {
    private static runningGameStorage: RunningGameStorage

    public runningGames = new Map<string, Game>()
    public readonly mInMS = 60000 //1 minute in ms

    private constructor() {
    }

    public static instance() {
        if (this.runningGameStorage == null) {
            this.runningGameStorage = new RunningGameStorage()
        }

        return this.runningGameStorage
    }

    startGame(token: string, category: string) {
        if (this.isGameRunning(token)) {
            return StatusCodes.Unauthorized
        }

        const timeRemaining = Date.now() + (this.mInMS * 15) //TODO: maybe change time
        this.runningGames.set(<string>token, new Game(timeRemaining, category, false)) //TODO: Implement hardCore
        return StatusCodes.Ok
    }

    getTime(token: string) {
        if (this.isGameRunning(token)) {
            return -1
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return -1
        }

        return game.time
    }


    private isGameRunning(token: string): boolean {
        return !this.runningGames.has(<string>token) || (this.runningGames.get(token) == undefined)
    }
}

export default RunningGameStorage