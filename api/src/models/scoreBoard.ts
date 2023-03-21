import {DataTypes, Model, InferAttributes, InferCreationAttributes} from 'sequelize'
import {sequelize} from '../db/sequelizeConnector'

class ScoreBoard extends Model<InferAttributes<ScoreBoard>, InferCreationAttributes<ScoreBoard>> {
    declare tokenKey: string
    declare category: string
    declare level: number
    declare time: number
}

ScoreBoard.init({
        tokenKey: {
            type: new DataTypes.STRING(28),
            primaryKey: true
        },
        category: {
            type: new DataTypes.STRING(500)
        },
        level: {
            type: new DataTypes.INTEGER,
        },
        time: {
            type: new DataTypes.INTEGER,
        }
    },
    {
        tableName: 'scores',
        sequelize
    }
)
export default ScoreBoard
