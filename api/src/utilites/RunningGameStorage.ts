import {StatusCodes} from "./StatusCodes";
import Game from "./game";
import ScoreBoard from "../models/scoreBoard";
import {GameModes} from "./gameModes";
import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";
import {GameException} from "../exceptions/GameException"

class RunningGameStorage {
    private static runningGameStorage: RunningGameStorage

    public runningGames = new Map<string, Game>()

    private constructor() {
    }

    public static instance() {
        if (!this.runningGameStorage) {
            this.runningGameStorage = new RunningGameStorage()
        }

        return this.runningGameStorage
    }

    startGame(token: string, category: string, difficulty: GameModes, maxTimePerQuestion = Infinity) {
        if (this.isGameRunning(token)) {
            return StatusCodes.Unauthorized
        }

        this.runningGames.set(<string>token, new Game(BigInt((new Date()).getTime()), category, difficulty, maxTimePerQuestion, <string>token))
        return StatusCodes.Ok
    }

    hasQuestion(token: string): boolean {
        if (!this.isGameRunning(token)) {
            return false
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return false
        }

        return game.hasQuestion()
    }

    async evaluateGame(token: string, answer: string) {
        if (!this.isGameRunning(token)) {
            return undefined
        }

        try {
            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return await game.evaluateGame(answer)
        } catch (e) {
            if (e instanceof GameException) {
                return new Promise(resolve => {
                    resolve(e.win)
                })
            }
        }
    }

    giveUpGame(token: string, save: boolean): boolean {
        if (!this.isGameRunning(token)) {
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
            const level = game?.level - 1
            const time = BigInt(new Date().getTime() - Number(game?.time))
            sequelize.sync()
                .then(() => {
                    ScoreBoard.create({
                        tokenKey: token,
                        category: <string>category,
                        level: <number>level,
                        time: <bigint>time
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
        if (!this.isGameRunning(token)) {
            return
        }

        let game = this.runningGames.get(<string>token)

        if (save && !!game) {
            let level = 0
            switch (game?.level - 1) {
                case 5:
                case 6:
                case 7:
                case 8:
                case 9: {
                    level = 5
                    break
                }
                case 10:
                case 11:
                case 12:
                case 13:
                case 14: {
                    level = 10
                    break
                }
                case 15: {
                    level = 15
                    break
                }
                default: {
                    level = 0
                }
            }

            const category = game?.category
            const time = BigInt(new Date().getTime() - Number(game?.time))
            sequelize.sync()
                .then(() => {
                    ScoreBoard.create({
                        tokenKey: token,
                        category: <string>category,
                        level: <number>level,
                        time: <bigint>time
                    })
                        .catch((error) => {
                            console.error('Failed to save game: ', error)
                        })
                })
        }

        this.runningGames.delete(token)
    }

    getTime(token: string) {
        if (!this.isGameRunning(token)) {
            return -1
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return -1
        }

        return game.time
    }

    getRemainingTime(token: string) {
        if (!this.isGameRunning(token)) {
            return -1
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return -1
        }

        return game.time - BigInt((new Date()).getTime())
    }

    //TODO: Wrap the game.use... methods in to try catch
    useHalf(token: string): Question | undefined {
        try {
            if (!this.isGameRunning(token)) {
                return undefined
            }

            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return game.useHalf()
        } catch (error) {
            throw new GameException('Error in RunninGameStorage:useHalf method\n' + error)
        }
    }

    useSwitch(token: string): Promise<Question | undefined> | undefined {
        try {

            if (!this.isGameRunning(token)) {
                return undefined
            }

            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return game.useSwitch()

        } catch (error) {

            throw new GameException('Error in RunninGameStorage:useSwitch method\n' + error)
        }
    }

    useAudience(token: string): Array<number> | undefined {
        try {

            if (!this.isGameRunning(token)) {
                return undefined
            }

            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return game.useAudience()

        } catch (error) {

            throw new GameException('Error in RunninGameStorage:useAudience method\n' + error)
        }
    }

    getLevel(token: string): number | undefined {
        if (!this.isGameRunning(token)) {
            return undefined
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return undefined
        }

        return game.level
    }

    getDifficulty(token: string): GameModes | undefined {
        if (!this.isGameRunning(token)) {
            return undefined
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return undefined
        }

        return game.difficulty
    }

    private isGameRunning(token: string): boolean {
        return this.runningGames.has(<string>token) || !this.runningGames.get(token) == undefined
    }
}

export default RunningGameStorage
