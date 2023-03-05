import {DataTypes, Model, InferAttributes, InferCreationAttributes} from 'sequelize'
import {sequelize} from '../db/sequelizeConnector'

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {

    declare tokenKey: string
    declare name: string
    declare email: string
    declare firstName: string
    declare lastName: string
    declare isAdmin: boolean
}

User.init({
        tokenKey: {
            type: new DataTypes.STRING(28),
            primaryKey: true
        },
        name: {
            type: new DataTypes.STRING(255),
        },
        email: {
            type: new DataTypes.STRING(256), //https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3
        },
        firstName: {
            type: new DataTypes.STRING(255),
        },
        lastName: {
            type: new DataTypes.STRING(255),
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
