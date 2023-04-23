import {Sequelize} from 'sequelize'
import process from "process";

const dbUrl: any = {

    //deploy
    deploy: 'postgres://localhost:5432/kreditmilliomos',

    //development
    dev: 'postgres://gergocs:V4jxgFA2GCzi@ep-solitary-surf-336790.eu-central-1.aws.neon.tech/neondb?sslmode=require',
}

const sequelize = new Sequelize(process.argv[2] === "https" ? dbUrl.deploy : dbUrl.dev, {
    logging: false //If you need more log, then enable this. Don't forget to reset it to false after you are done with development.
})

export {sequelize}
