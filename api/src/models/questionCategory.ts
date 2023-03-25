import { DataTypes, Model, InferAttributes, InferCreationAttributes  } from 'sequelize'
import { sequelize } from '../db/sequelizeConnector'

class QuestionCategory extends Model<InferAttributes<QuestionCategory>,InferCreationAttributes<QuestionCategory>> {
    declare category: string
}

QuestionCategory.init({
        category: {
            type: new DataTypes.STRING(255),
            primaryKey: true
        },
    },
    {
        tableName: 'questioncategory',
        sequelize
    }
)
export default QuestionCategory