import { DataTypes, Model, InferAttributes, InferCreationAttributes  } from 'sequelize'
import { sequelize } from '../db/sequelizeConnector'

class User extends Model<InferAttributes<User>,InferCreationAttributes<User>> {

    declare tokenKey: string
    declare isAdmin: boolean
}

User.init({
        tokenKey: {
            type: new DataTypes.STRING(255),
            primaryKey: true
        },
        isAdmin: {
            type: new DataTypes.BOOLEAN
        },
    },
    {
        tableName: 'users',
        sequelize
    }
)
export default User