import { DataTypes, Model, InferAttributes, InferCreationAttributes  } from 'sequelize'
import { sequelize } from '../db/sequelizeConnector'
import QuestionCategory from './questionCategory'

class Question extends Model<InferAttributes<Question>,InferCreationAttributes<Question>> {
    
    declare category: string
    declare question: string
    declare level: number
    declare answerA: string
    declare answerB: string
    declare answerC: string
    declare answerD: string
    declare answerCorrect: string
}

Question.init({
        category: {
            type: new DataTypes.STRING(255),
            references:{model:{tableName:'questioncategory'},key:'category'}
        },
        question: {
            type: new DataTypes.STRING(500),
            primaryKey: true
        },
        level: {
            type: new DataTypes.INTEGER,
        },
        answerA: {
            type: new DataTypes.STRING(500)
        },
        answerB: {
            type: new DataTypes.STRING(500)
        },
        answerC: {
            type: new DataTypes.STRING(500)
        },
        answerD: {
            type: new DataTypes.STRING(500)
        },
        answerCorrect: {
            type: new DataTypes.STRING(500)
        }
    },
    {
        tableName: 'questions',
        sequelize
    }
)
export default Question