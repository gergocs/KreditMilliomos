import {StatusCodes} from "./StatusCodes";
import Game from "./game";
import ScoreBoard from "../models/scoreBoard";
import {GameModes} from "./gameModes";
import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";
import {GameException} from "../exceptions/GameException"
import CacheHandler from "./cacheHandler";
import Achievement from "../models/achievement";
import QuestionCategory from "../models/questionCategory";
import Achievements from "./achievements";

class RunningGameStorage {
    private static runningGameStorage: RunningGameStorage

    public runningGames = new Map<string, Game>()
    private readonly minute = 60 * 1000

    private constructor() {
        //Bob the cleaner
        setInterval(() => {
            for (let [key, value] of this.runningGames.entries()) {
                if (value.lastUpdate + (this.minute * 15) < (new Date()).getTime()) { // 900000 ms = 15 minutes
                    this.runningGames.delete(key)
                }
            }
        }, this.minute) // every 1 minutes
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
                    }).then(() => {
                        this.handleAchievements(token, category, level)
                    })
                        .catch((error) => {
                            console.error('Failed to save game: ', error)
                        })
                })
        } else if (!!game) {
            this.handleAchievements(token, <string>game?.category, game?.level - 1)
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

    isTimeRunning(token: string): boolean {
        if (!this.isGameRunning(token)) {
            return false
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return false
        }

        return game.isTimerRunning
    }

    getRemainingTime(token: string) {
        if (!this.isGameRunning(token)) {
            return -1
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return -1
        }

        return game.endOfQuestionTime - (new Date()).getTime()
    }

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

            try {
                return game.useSwitch()
            } catch (error) {
                return undefined
            }


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
        try {
            if (!this.isGameRunning(token)) {
                return undefined
            }

            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return game.level
        } catch (error) {
            throw new GameException('Error in RunninGameStorage:getLevel method\n' + error)
        }
    }

    getDifficulty(token: string): GameModes | undefined {
        try {
            if (!this.isGameRunning(token)) {
                return undefined
            }

            let game = this.runningGames.get(<string>token)

            if (!game) {
                return undefined
            }

            return game.difficulty
        } catch (error) {
            throw new GameException('Error in RunninGameStorage:getDifficulty method\n' + error)
        }
    }

    private isGameRunning(token: string): boolean {
        try {
            return this.runningGames.has(<string>token) || !this.runningGames.get(token) == undefined
        } catch (error) {
            throw new GameException('Error in RunninGameStorage:isGameRunning method\n' + error)
        }
    }

    getQuestion(token: string): string | undefined {
        if (!this.isGameRunning(token)) {
            return undefined
        }

        let game = this.runningGames.get(<string>token)

        if (!game) {
            return undefined
        }

        return game.question?.answerCorrect
    }

    private handleAchievements(token: string, category: string, level: number) {
        sequelize.sync().then(() => {
            ScoreBoard.findAndCountAll({
                where: {tokenKey: token}
            }).then(async ({count, rows}) => {
                let userAchievements = await Achievement.findOne({where: {tokenKey: token}})
                let achievementArray = new Array<string>()

                if (userAchievements) {
                    achievementArray = userAchievements.achievement
                } else {
                    await Achievement.create({
                        tokenKey: token,
                        achievement: achievementArray
                    })
                }

                let prevAchievementArray = JSON.parse(JSON.stringify(achievementArray))
                let categoryLvl1 = 'lvl1'
                let categoryLvl2 = 'lvl2'
                let categoryLvl3 = 'lvl3'
                let categoryNumber = this.categoryChecker(rows, <string>category)


                if (!achievementArray.includes(category + categoryLvl1) && categoryNumber === 1) {
                    achievementArray.push(category + categoryLvl1)
                } else if (!achievementArray.includes(category + categoryLvl2) && categoryNumber === 2) {
                    achievementArray.push(category + categoryLvl2)
                } else if (!achievementArray.includes(category + categoryLvl3) && categoryNumber === 3) {
                    achievementArray.push(category + categoryLvl3)
                }

                if (count >= Achievements.multipleGamesLvl3 && !achievementArray.includes(Achievements.multipleGamesLvl3 + "+ Games")) {
                    if (achievementArray.includes(Achievements.multipleGamesLvl2 + "+ Games")) {
                        let index = achievementArray.indexOf(Achievements.multipleGamesLvl2 + "+ Games")

                        if (index !== -1) {
                            achievementArray.splice(index, 1)
                        }
                    }

                    achievementArray.push(Achievements.multipleGamesLvl3 + "+ Games")
                } else if (count >= Achievements.multipleGamesLvl2
                    && !achievementArray.includes(Achievements.multipleGamesLvl2 + "+ Games")
                    && !achievementArray.includes(Achievements.multipleGamesLvl3 + "+ Games")) {
                    if (achievementArray.includes(Achievements.multipleGamesLvl1 + "+ Games")) {
                        let index = achievementArray.indexOf(Achievements.multipleGamesLvl1 + "+ Games")

                        if (index !== -1) {
                            achievementArray.splice(index, 1)
                        }
                    }

                    achievementArray.push(Achievements.multipleGamesLvl2 + "+ Games")
                } else if (count >= Achievements.multipleGamesLvl1
                    && !achievementArray.includes(Achievements.multipleGamesLvl1 + "+ Games")
                    && !achievementArray.includes(Achievements.multipleGamesLvl2 + "+ Games")
                    && !achievementArray.includes(Achievements.multipleGamesLvl3 + "+ Games")) {
                    achievementArray.push(Achievements.multipleGamesLvl1 + "+ Games")
                }

                let kreditCounter = 0
                let winCounter = 0

                for (let i = 0; i < rows.length; i++) {
                    kreditCounter += rows[i].level
                    if (rows[i].level == 15) {
                        winCounter++
                    }
                }

                if (kreditCounter >= Achievements.KreditLvl3 && !achievementArray.includes(Achievements.KreditLvl3 + "+ Kredit")) {
                    if (achievementArray.includes(Achievements.KreditLvl2 + "+ Kredit")) {
                        let index = achievementArray.indexOf(Achievements.KreditLvl2 + "+ Kredit")

                        if (index !== -1) {
                            achievementArray.splice(index, 1)
                        }
                    }

                    achievementArray.push(Achievements.KreditLvl3 + "+ Kredit")
                } else if (kreditCounter >= Achievements.KreditLvl2
                    && !achievementArray.includes(Achievements.KreditLvl2 + "+ Kredit")
                    && !achievementArray.includes(Achievements.KreditLvl3 + "+ Kredit")) {
                    if (achievementArray.includes(Achievements.KreditLvl1 + "+ Kredit")) {
                        let index = achievementArray.indexOf(Achievements.KreditLvl1 + "+ Kredit")

                        if (index !== -1) {
                            achievementArray.splice(index, 1)
                        }
                    }

                    achievementArray.push(Achievements.KreditLvl2 + "+ Kredit")
                } else if (kreditCounter >= Achievements.KreditLvl1
                    && !achievementArray.includes(Achievements.KreditLvl1 + "+ Kredit")
                    && !achievementArray.includes(Achievements.KreditLvl2 + "+ Kredit")
                    && !achievementArray.includes(Achievements.KreditLvl3 + "+ Kredit")) {
                    achievementArray.push(Achievements.KreditLvl1 + "+ Kredit")
                }


                if (winCounter >= Achievements.WinLvl3 && !achievementArray.includes(Achievements.WinLvl3 + "+ win")) {
                    if (achievementArray.includes(Achievements.WinLvl2 + "+ win")) {
                        let index = achievementArray.indexOf(Achievements.WinLvl2 + "+ win")

                        if (index !== -1) {
                            achievementArray.splice(index, 1)
                        }
                    }

                    achievementArray.push(Achievements.WinLvl3 + "+ win")
                } else if (winCounter >= Achievements.WinLvl2
                    && !achievementArray.includes(Achievements.WinLvl2 + "+ win")
                    && !achievementArray.includes(Achievements.WinLvl3 + "+ win")) {
                    if (achievementArray.includes(Achievements.WinLvl1 + "+ win")) {
                        let index = achievementArray.indexOf(Achievements.WinLvl1 + "+ win")

                        if (index !== -1) {
                            achievementArray.splice(index, 1)
                        }
                    }

                    achievementArray.push(Achievements.WinLvl2 + "+ win")
                } else if (winCounter >= Achievements.WinLvl1
                    && !achievementArray.includes(Achievements.WinLvl1 + "+ win")
                    && !achievementArray.includes(Achievements.WinLvl2 + "+ win")
                    && !achievementArray.includes(Achievements.WinLvl3 + "+ win")) {
                    achievementArray.push(Achievements.WinLvl1 + "+ win")
                }


                if (!achievementArray.includes("level5") && this.levelChecker(rows, Achievements.Level5)) {
                    achievementArray.push("level5")
                }

                if (!achievementArray.includes("level10") && this.levelChecker(rows, Achievements.Level10)) {
                    achievementArray.push("level10")
                }

                if (!achievementArray.includes("level15") && this.levelChecker(rows, Achievements.Level15)) {
                    achievementArray.push("level15")
                }

                let data = new Map<string, string>()

                data.set("kredit", String(kreditCounter))
                data.set("oldKredit", String(kreditCounter - level))
                data.set("game", String(count))
                data.set("win", String(winCounter))
                data.set("oldWin", String(winCounter - Number(level === 15)))
                data.set("kreditLevel", '0')
                data.set("gameLevel", '0')
                data.set("winLevel", '0')

                for (let i = 0; i < achievementArray.length; i++) {
                    if (achievementArray[i].includes('Kredit')) {
                        data.set("kreditLevel", achievementArray[i].substring(0, 3))
                    } else if (achievementArray[i].includes('Games')) {
                        data.set("gameLevel", achievementArray[i].substring(0, 2))
                    } else if (achievementArray[i].includes('win')) {
                        data.set("winLevel", achievementArray[i].substring(0, 2))
                    }
                }

                let difference = achievementArray.filter(x => !prevAchievementArray.includes(x));

                if (difference.length != 0) {
                    data.set("achievements", JSON.stringify(difference))
                }

                CacheHandler.getInstance().set(token + 'achievements', data, 10000)

                await Achievement.update({
                    achievement: achievementArray
                }, {
                    where: {
                        tokenKey: token
                    }
                })
            })
        }).catch(err => {

        })
    }

    private categoryChecker(scoreBoard: ScoreBoard[], category: string): number {
        let counter = 0;

        for (let i = 0; i < scoreBoard.length; i++) {
            if (scoreBoard[i].category === category) {
                counter++;
            }

            if (counter >= Achievements.CategoryLvl3) {
                break;
            }
        }

        if (counter >= Achievements.CategoryLvl3) {
            return 3
        } else if (counter >= Achievements.CategoryLvl2) {
            return 2
        } else if (counter >= Achievements.CategoryLvl1) {
            return 1
        }

        return 0
    }

    private levelChecker(scoreBoard: ScoreBoard[], level: number): boolean {
        let counter = 0

        for (let i = 0; i < scoreBoard.length; i++) {
            if (scoreBoard[i].level >= level) {
                counter++
            }

            if (counter >= 15) {
                return true
            }
        }

        return false
    }
}

export default RunningGameStorage
