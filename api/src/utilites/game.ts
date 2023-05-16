import Question from "../models/question";
import {sequelize} from "../db/sequelizeConnector";
import {GameModes} from "./gameModes";
import {GameException} from "../exceptions/GameException";
import {Op} from "sequelize";
import User from "../models/user";

class Game {

    private readonly _time: bigint /* start of (game) time represented in unix epoch */
    private readonly maxTimePerQuestion: number /* may time per Question */
    private _endOfQuestionTime: number /* time when the answer will be invalid */
    private _question: Question | undefined /* current question */
    private _category: string /* current question */
    private half: boolean /* half the questions */
    private switch: boolean /* switch help */
    private audience: boolean /* random help */
    difficulty: GameModes /* difficulty of the game*/
    private _level: number /* current level */
    private previousQuestion: Array<string> /* previous questions */
    private _lastUpdate: number /* time when the current game has been interacted with */
    private _isTimerRunning: boolean /* whether the gametimer is running */

    constructor(time: bigint, subject: string, difficulty: GameModes, maxTimePerQuestion: number, tokenKey: string) {
        this._time = time
        this._question = undefined
        this._category = subject
        this.half = true
        this.switch = true
        this.audience = true
        this.difficulty = difficulty
        this._lastUpdate = new Date().getTime()
        this.previousQuestion = new Array<string>()
        this.maxTimePerQuestion = maxTimePerQuestion * 1000
        this.isTimerRunning = false

        sequelize.sync()
            .then(() => {
                User.findOne({where: {tokenKey}})
                    .then(user => {
                        if (user && user.isAdmin) {
                            this._level = 13;
                        } else {
                            this._level = 1;
                        }
                    })
                    .catch(error => {
                        this._level = 1;
                    })
            })
            .catch(error => {
                this._level = 1;
            })
    }

    get endOfQuestionTime(): number {
        return this._endOfQuestionTime;
    }

    get isTimerRunning(): boolean {
        return this._isTimerRunning;
    }

    set isTimerRunning(value: boolean) {
        this._isTimerRunning = value;
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

    get lastUpdate(): number {
        return this._lastUpdate;
    }

    hasQuestion(): boolean {
        return !!this._question
    }

    get question(): Question | undefined {
        return this._question;
    }

    async evaluateGame(answer: string): Promise<Question | boolean> {
        this._isTimerRunning = false

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
        this._lastUpdate = new Date().getTime()

        if (!this._question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.half) {
            throw new GameException("The user already used half")
        }

        // Please god send us help
        let correctQuestion = 'A' == this._question.answerCorrect
            ? 0 : 'B' == this._question.answerCorrect
                ? 1 : 'C' == this._question.answerCorrect
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
                this._question.answerA = ""
                break
            }
            case 1: {
                this._question.answerB = ""
                break
            }
            case 2: {
                this._question.answerC = ""
                break
            }
            case 3: {
                this._question.answerD = ""
                break
            }
            default: {
                throw new GameException("Unreachable case reached")
            }
        }

        switch (randomNumber2) {
            case 0: {
                this._question.answerA = ""
                break
            }
            case 1: {
                this._question.answerB = ""
                break
            }
            case 2: {
                this._question.answerC = ""
                break
            }
            case 3: {
                this._question.answerD = ""
                break
            }
            default: {
                throw new GameException("Unreachable case reached")
            }
        }

        this.half = false
        return JSON.parse(JSON.stringify(this._question))
    }

    async useSwitch(): Promise<Question> {
        this._lastUpdate = new Date().getTime()

        if (!this._question) {
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
        this._lastUpdate = new Date().getTime()

        if (!this._question) {
            throw new GameException("The game dont generated question")
        }

        if (!this.audience) {
            throw new GameException("The user already used audience")
        }

        // Please god send us help again
        let correctQuestion = ('A' == this._question.answerCorrect
            ? 0 : 'B' == this._question.answerCorrect
                ? 1 : 'C' == this._question.answerCorrect
                    ? 2 : 3) + (((this._question.answerA === ''
            || this._question.answerB === ''
            || this._question.answerC === ''
            || this._question.answerD === '') ? 0 : 1) * this.randomOffset(this._question.level))

        let skip1 = (this._question.answerA === ''
            ? 0 : this._question.answerB === ''
                ? 1 : this._question.answerC === ''
                    ? 2 : this._question.answerD === '' ? 3 : NaN)

        let skip2 = (this._question.answerD === ''
            ? 3 : this._question.answerC === ''
                ? 2 : this._question.answerB === ''
                    ? 1 : this._question.answerA === '' ? 0 : NaN)

        if (correctQuestion >= 4) {
            correctQuestion -= 4
        }

        let arrayOfRandoms = new Array<number>(0)
        let counts = new Array<number>(4)

        for (let i = 0; i < 100; i++) {
            arrayOfRandoms.push(this.weightedRandom(correctQuestion, skip1, skip2))
        }

        arrayOfRandoms.forEach(function (x) {
            counts[x] = (counts[x] || 0) + 1;
        });

        this.audience = false

        return counts
    }

    private generateQuestion(offset = 1): Promise<Question> {
        this._lastUpdate = new Date().getTime()

        if (this._level === 16 && offset !== 0) {
            throw new GameException("", true)
        }

        return new Promise<Question>((resolve) => {
            sequelize.sync()
                .then(() => {
                    Question.findAndCountAll({
                        where: {
                            level: (!this._question ? (Math.max((this.difficulty * 5), 1)) : (Math.min((this._question.level + offset), 15))),
                            category: this.category,
                            question: {
                                [Op.notIn]: this.previousQuestion
                            }
                        }
                    })
                        .then(({count, rows}) => {
                            this._question = rows[this.getRandomInt(0, count - 1)]
                            this.previousQuestion.push(this._question.question)
                            this._level += offset
                            this._endOfQuestionTime = new Date().getTime() + this.maxTimePerQuestion // number + Infinity = Infinity
                            this._isTimerRunning = true
                            resolve(this._question)
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
        if (!this._question) {
            throw new GameException("The game doesn't generated any questions!")
        }

        return ((new Date()).getTime() < this._endOfQuestionTime) && answer.toLowerCase() === this._question.answerCorrect.toLowerCase()
    }

    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min)
        return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
    }

    // Random offset between 0 and 3
    private randomOffset(level: number): number {
        let rand = Math.random()
        if (rand < (100 - level * 2) / 100) { // 0.98-0.60
            return 0
        } else if (rand >= 0.5 && rand < 0.6) {  // ~0.1
            return 1
        } else if (rand >= 0.6 && rand < 0.75) { // ~0.15
            return 2
        } else {
            return 3
        }
    }

    private weightedRandom(correct: number, skip1: number, skip2: number): number {
        let val = this.gaussianRandom();

        if (Math.abs(val) < 1) { // ~0.6827
            return correct
        } else if (val <= -1 && val > -2) { // ~0.136
            let guess = correct == 0 ? 1 : (correct == 1 ? 2 : (correct == 2 ? 3 : 0))

            if (!isNaN(skip1)) {
                return correct
            }

            return guess
        } else if (val >= 1 && val < 2) { // ~0.136
            let guess = correct == 0 ? 2 : (correct == 1 ? 3 : (correct == 2 ? 0 : 1))

            if (!isNaN(skip1) && (guess === skip1 || guess === skip2)) {
                return correct
            }

            return guess
        } else { // ~0.0455
            let guess = correct == 0 ? 3 : (correct == 1 ? 0 : (correct == 2 ? 1 : 2))

            if (!isNaN(skip1) && (guess === skip1 || guess === skip2)) {
                return correct
            }

            return guess
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
