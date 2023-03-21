import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";
import {GameModes} from "./gameModes";

class Game {

    private readonly _time: number /* end of (game) time represented in unix epoch */
    private question: Question | undefined /* current question */
    private category: string /* current question */
    private half: boolean /* half the questions */
    private switch: boolean /* switch help */
    private audience: boolean /* random help */
    private difficulty: GameModes /* difficulty of the game*/
    private level: number /* current level */

    constructor(time: number, subject: string, difficulty: GameModes) {
        this._time = time
        this.question = undefined
        this.category = subject
        this.half = true
        this.switch = true
        this.audience = true
        this.difficulty = difficulty
    }

    get time(): number {
        return this._time
    }

    hasQuestion(): boolean {
        return !!this.question
    }

    evaluateGame(answer: string): Question | undefined {
        if (!this.question){
            return this.generateQuestion()
        }

        let status = this.checkAnswer(answer)

        if (!status) {
            return undefined
        }

        return this.generateQuestion()
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
        let correctQuestion = this.question.answerA == this.question.answerCorrect
            ? 0 : this.question.answerB == this.question.answerCorrect
                ? 1 : this.question.answerC == this.question.answerCorrect
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
        return this.question
    }

    useSwitch(): Question {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.switch) {
            throw new GameException("The user already used switch")
        }

        let question = this.generateQuestion(0)
        this.switch = false

        return question
    }

    useAudience(): string {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.audience) {
            throw new GameException("The user already used audience")
        }

        const myAnswers = [this.question.answerA, this.question.answerB, this.question.answerC, this.question.answerD]
        const probabilityMassOfMyAnswers = [0.5, 0.8, 0.1, 0.3]
        const answerIGot = this.getWeightedRandom(myAnswers, probabilityMassOfMyAnswers)

        this.audience = false
        return answerIGot
    }

    private generateQuestion(offset = 1): Question {
        if (this.level == 15) {
            throw new GameException("", true)
        }
        // TODO: catch sequelize errors
        sequelize.sync()
            .then(() => {
                Question.findAndCountAll({
                    where: {
                        level: (!this.question ? (Math.max((this.difficulty * 5), 1)) : (Math.min((this.question.level + offset), 15))), // TODO: Check if this is good
                        category: this.category
                    }
                })
                    .then(({count, rows}) => {
                        this.question = rows[this.getRandomInt(0, count)]
                        this.level += offset
                    })
            })

        return structuredClone(<Question>this.question)
    }

    private checkAnswer(answer: string): boolean {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        return answer === this.question.answerCorrect
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
