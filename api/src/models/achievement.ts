import {DataTypes, Model, InferAttributes, InferCreationAttributes, Sequelize} from 'sequelize'
import {sequelize} from '../db/sequelizeConnector'

class Achievement extends Model<InferAttributes<Achievement>, InferCreationAttributes<Achievement>> {
    declare tokenKey: string
    declare achievement: string[]
}

Achievement.init({
        tokenKey: {
            type: new DataTypes.STRING(28),
            primaryKey: true
        },
        achievement: {
            type: new DataTypes.ARRAY(DataTypes.STRING),
        }
    },
    {
        tableName: 'achievements',
        sequelize
    }
)
export default Achievement
