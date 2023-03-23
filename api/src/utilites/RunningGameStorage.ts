import {StatusCodes} from "./StatusCodes";
import Game from "./game";
import ScoreBoard from "models/scoreBoard";
import {GameModes} from "./gameModes";
import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";

class RunningGameStorage {
    private static runningGameStorage: RunningGameStorage

    public runningGames = new Map<string, Game>()
    public readonly mInMS = 60000 //1 minute in ms

    private constructor() {
    }

    public static instance() {
        if (this.runningGameStorage === null) {
            this.runningGameStorage = new RunningGameStorage()
        }

        return this.runningGameStorage
    }

    startGame(token: string, category: string, difficulty: GameModes) {
        if (this.isGameRunning(token)) {
            return StatusCodes.Unauthorized
        }

        //TODO: maybe change time
        const timeRemaining = (new Date()).getTime() + (this.mInMS * 15)
        this.runningGames.set(<string>token, new Game(timeRemaining, category, difficulty))
        return StatusCodes.Ok
    }

    hasQuestion(token: string): boolean {
        if (this.isGameRunning(token)) {
            return false
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return false
        }

        return game.hasQuestion()
    }

    evaluateGame(token: string, answer: string): Question | undefined | boolean {
        if (this.isGameRunning(token)) {
            return undefined
        }

        try {
            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return game.evaluateGame(answer)
        } catch (e) {
            if (e instanceof GameException) {
                return e.win
            }
        }
    }

    giveUpGame(token: string, save: boolean): boolean {
        if (this.isGameRunning(token)) {
            return false
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return false
        }

        if (!game.canGiveUp()) {
            return false
        }

        if (save) {
            const category = game?.category
            const level = game?.level
            const time = game?.time
            sequelize.sync()
            .then(() => {
                ScoreBoard.create({
                    tokenKey: token,
                    category: <string>category,
                    level: <number>level,
                    time: <number>time
                })
                .catch((error) => {
                     console.error('Failed to save game: ', error)
                })
        })
        }

        this.runningGames.delete(token)
        return true
    }

    endGame(token: string, save: boolean) {
        if (this.isGameRunning(token)) {
            return
        }

        let game = this.runningGames.get(<string>token)

        if (save) {
            const category = game?.category
            const level = game?.level
            const time = game?.time
            sequelize.sync()
            .then(() => {
            ScoreBoard.create({
                tokenKey: token,
                category: <string>category,
                level: <number>level,
                time: <number>time
            })
            .catch((error) => {
                console.error('Failed to save game: ', error)
            })
        })
        }

        this.runningGames.delete(token)
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

    getRemainingTime(token: string) {
        if (this.isGameRunning(token)) {
            return -1
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return -1
        }

        return game.time - (new Date()).getTime()
    }

    //TODO: Wrap the game.use... methods in to try catch
    useHalf(token: string): Question | undefined {
        if (this.isGameRunning(token)) {
            return undefined
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return undefined
        }

        return game.useHalf()
    }

    useSwitch(token: string): Question | undefined {
        if (this.isGameRunning(token)) {
            return undefined
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return undefined
        }

        return game.useSwitch()
    }

    useAudience(token: string): string | undefined {
        if (this.isGameRunning(token)) {
            return undefined
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return undefined
        }

        return game.useAudience()
    }

    private isGameRunning(token: string): boolean {
        return this.runningGames.has(<string>token) || !this.runningGames.get(token) == undefined
    }
}

export default RunningGameStorage
