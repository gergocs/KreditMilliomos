import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";

class Game {
    private readonly _time: Number /* end of (game) time represented in unix epoch */
    private question: Question | undefined /* current question */
    private category: string /* current question */
    private half: boolean /* half the questions */
    private mobile: boolean /* mobile help TODO: find solution to implement this to the game */
    private audience: boolean /* random help */
    private hardCore: boolean /* almost unwinnable level for Electronics and similar subjects */

    constructor(time: number, subject: string, hardCore: boolean) {
        this._time = time
        this.question = undefined
        this.category = subject
        this.half = true
        this.mobile = true
        this.audience = true
        this.hardCore = hardCore
    }

    get time(): Number {
        return this._time;
    }

    generateQuestion() {
        if (this.question?.level == 15) {
            // TODO win
        }
        sequelize.sync()
            .then(() => {
                Question.findAndCountAll({
                    where: {
                        level: (!this.question ? 1 : this.question.level + 1),
                        category: this.category
                    }
                })
                    .then(({count, rows}) => {
                        this.question = rows[this.getRandomInt(0, count)]
                    })
            })
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

    // TODO: Find solution to implement it
    useMobile(): Question {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.mobile) {
            throw new GameException("The user already used half")
        }

        this.mobile = false
        return this.question
    }

    /* TODO: add more weight for the correct answer */
    useAudience(): string {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.audience) {
            throw new GameException("The user already used half")
        }

        let randomNumber = this.getRandomInt(0, 3) // Random number between 0-3
        this.audience = false

        switch (randomNumber) {
            case 0: {
                return this.question.answerA
            }
            case 1: {
                return this.question.answerB
            }
            case 2: {
                return this.question.answerC
            }
            case 3: {
                return this.question.answerD
            }
            default: {
                throw new GameException("Unreachable case reached")
            }
        }
    }

    checkAnswer(answer: string): boolean {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.mobile) {
            throw new GameException("The user already used half")
        }

        return answer === this.question.answerCorrect
    }

    private getRandomInt(min, max): number {
        min = Math.ceil(min)
        return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
    }
}

export default Game
