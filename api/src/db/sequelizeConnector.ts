
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(
    'postgres://gergocs:V4jxgFA2GCzi@ep-solitary-surf-336790.eu-central-1.aws.neon.tech/neondb?sslmode=require')

export { sequelize }