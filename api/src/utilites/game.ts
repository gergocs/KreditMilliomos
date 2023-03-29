import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";
import {GameModes} from "./gameModes";
import question from "../models/question";
import {GameException} from "../exceptions/GameException";
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

    useAudience(): Array<number> {
        if (!this.question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.audience) {
            throw new GameException("The user already used audience")
        }

        // Please god send us help again
        let correctQuestion = ('A' == this.question.answerCorrect
            ? 0 : 'B' == this.question.answerCorrect
                ? 1 : 'C' == this.question.answerCorrect
                    ? 2 : 3) + this.randomOffset()

        if (correctQuestion >= 4) {
            correctQuestion -= 4
        }

        console.log(this.question.answerCorrect)

        let arrayOfRandoms = new Array<number>(10)
        let counts = new Array<number>()

        for (let i = 0; i < arrayOfRandoms.length; i++) {
            arrayOfRandoms.push(this.weightedRandom(correctQuestion))
        }

        arrayOfRandoms.forEach(function (x) {
            counts[x] = (counts[x] || 0) + 1;
        });

        this.audience = false

        return counts
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

    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min)
        return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
    }

    // Random offset between 0 and 3
    private randomOffset(): number {
        let rand = Math.random()
        if (rand < 0.5) { // ~0.5
            return 0
        } else if (rand >= 0.5 && rand < 0.6) {  // ~0.1
            return 1
        } else if (rand >= 0.6 && rand < 0.75) { // ~0.15
            return 2
        } else { // ~0.25
            return 3
        }
    }

    private weightedRandom(correct: number): number {
        let val = this.gaussianRandom();

        if (Math.abs(val) < 1) { // ~0.6827
            return correct
        } else if (val <= -1 && val > -2) { // ~0.136
            return correct == 0 ? 1 : (correct == 1 ? 2 : (correct == 2 ? 3 : 0))
        } else if (val >= 1 && val < 2) { // ~0.136
            return correct == 0 ? 2 : (correct == 1 ? 3 : (correct == 2 ? 0 : 1))
        } else { // ~0.0455
            return correct == 0 ? 3 : (correct == 1 ? 0 : (correct == 2 ? 1 : 2))
        }
    }

    // Gaussian random number https://en.wikipedia.org/wiki/Normal_distribution
    private gaussianRandom(mean = 0, stdev = 1) {
        let u = 1 - Math.random(); // Converting [0,1) to (0,1]
        let v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }
}

export default Game
