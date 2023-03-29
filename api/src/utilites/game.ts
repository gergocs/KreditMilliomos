import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";
import {GameModes} from "./gameModes";
import question from "../models/question";
import { GameException } from "../exceptions/GameException";
import {Op} from "sequelize";

class Game {

    private readonly _time: bigint /* end of (game) time represented in unix epoch */
    private question: Question | undefined /* current question */
    private _category: string /* current question */
    private half: boolean /* half the questions */
    private switch: boolean /* switch help */
    private audience: boolean /* random help */
    private difficulty: GameModes /* difficulty of the game*/
    private _level: number /* current level */
    private previousQuestion: Array<string> /* previous questions */

    constructor(time: bigint, subject: string, difficulty: GameModes) {
        this._time = time
        this.question = undefined
        this._category = subject
        this.half = true
        this.switch = true
        this.audience = true
        this.difficulty = difficulty
        this._level = 1
        this.previousQuestion = new Array<string>()
    }

    get time(): bigint {
        return this._time
    }

    get category(): string {
        return this._category
    }

    get level(): number {
        return this._level
    }

    hasQuestion(): boolean {
        return !!this.question
    }

    async evaluateGame(answer: string): Promise<Question | boolean> {
        if (!this.hasQuestion()) {
            return await this.generateQuestion();
        }

        let status = this.checkAnswer(answer)

        if (!status) {
            return false
        }

        return await this.generateQuestion();
    }

    canGiveUp(): boolean {
        return !(this.half || this.switch || this.audience)
    }

    useHalf(): Question {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.half) {
            throw new GameException("The user already used half")
        }

        // Please god send us help
        let correctQuestion = 'A' == this.question.answerCorrect
            ? 0 : 'B' == this.question.answerCorrect
                ? 1 : 'C' == this.question.answerCorrect
                    ? 2 : 3

        let randomNumber1 = this.getRandomInt(0, 2) // Random number between 0-2

        if (randomNumber1 >= correctQuestion) {
            randomNumber1++
        }

        let randomNumber2 = this.getRandomInt(0, 1) // Random number between 0-2

        if (randomNumber2 >= Math.min(correctQuestion, randomNumber1)) {
            randomNumber2++
        }

        if (randomNumber2 >= Math.max(correctQuestion, randomNumber1)) {
            randomNumber2++;
        }

        switch (randomNumber1) {
            case 0: {
                this.question.answerA = ""
                break
            }
            case 1: {
                this.question.answerB = ""
                break
            }
            case 2: {
                this.question.answerC = ""
                break
            }
            case 3: {
                this.question.answerD = ""
                break
            }
            default: {
                throw new GameException("Unreachable case reached")
            }
        }

        switch (randomNumber2) {
            case 0: {
                this.question.answerA = ""
                break
            }
            case 1: {
                this.question.answerB = ""
                break
            }
            case 2: {
                this.question.answerC = ""
                break
            }
            case 3: {
                this.question.answerD = ""
                break
            }
            default: {
                throw new GameException("Unreachable case reached")
            }
        }

        this.half = false
        return JSON.parse(JSON.stringify(this.question))
    }

    async useSwitch(): Promise<Question> {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.switch) {
            throw new GameException("The user already used switch")
        }

        let question = this.generateQuestion(0)
        this.switch = false

        return await question
    }

    useAudience(): string {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.audience) {
            throw new GameException("The user already used audience")
        }

        const myAnswers = [this.question.answerA, this.question.answerB, this.question.answerC, this.question.answerD]
        const probabilityMassOfMyAnswers: Array<number> = [
            (this.question.answerA == this.question.answerCorrect ? 0.8 : 0.5) as number,
            (this.question.answerB == this.question.answerCorrect ? 0.8 : 0.1) as number,
            (this.question.answerC == this.question.answerCorrect ? 0.8 : 0.3) as number,
            (this.question.answerD == this.question.answerCorrect ? 0.8 : 0.5) as number
        ]
        const answerIGot = this.getWeightedRandom(myAnswers, probabilityMassOfMyAnswers)

        this.audience = false
        return answerIGot
    }

    private generateQuestion(offset = 1): Promise<Question> {
        // TODO: _level = 16
        if (this._level == 3) {
            throw new GameException("", true)
        }

        return new Promise<Question>((resolve, reject) => {
            // TODO: catch sequelize errors
            sequelize.sync()
                .then(() => {
                    Question.findAndCountAll({
                        where: {
                            level: (!this.question ? (Math.max((this.difficulty * 5), 1)) : (Math.min((this.question.level + offset), 15))), // TODO: Check if this is good
                            category: this.category,
                            question: {
                                [Op.notIn]: this.previousQuestion
                            }
                        }
                    })
                        .then(({count, rows}) => {
                            this.question = rows[this.getRandomInt(0, count - 1)]
                            this.previousQuestion.push(this.question.question)
                            this._level += offset
                            resolve(this.question)
                        })
                        .catch(error => {
                            throw new GameException("Error in Question.findAndCountAll!\n" + error)
                        })
                })
                .catch(error => {
                    throw new GameException("Error in sequelize.sync!\n" + error)
                })
        })
    }

    private checkAnswer(answer: string): boolean {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        return answer.toLowerCase() === this.question.answerCorrect.toLowerCase()
    }

    private getRandomInt(min, max): number {
        min = Math.ceil(min)
        return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
    }

    private getWeightedRandom(answerOptions: Array<string>, probabilityMassOfMyAnswers: Array<number>) {
        const cumulativeDistribution = probabilityMassOfMyAnswers.map((sum => value => sum += value)(0))
        const myRandom = Math.random()
        const indexOfWeightedRandom = cumulativeDistribution.filter(e => myRandom >= e).length

        return answerOptions[indexOfWeightedRandom]
    }
}

export default Game
