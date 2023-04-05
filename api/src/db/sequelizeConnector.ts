import { Sequelize } from 'sequelize'

const dbUrl: any = {

    // new deploy
    local: 'postgres://localhost:5432/kreditmilliomos',

    //deploy-hoz!
    main: 'postgres://gergocs:V4jxgFA2GCzi@ep-solitary-surf-336790.eu-central-1.aws.neon.tech/neondb?sslmode=require',
}

//URL végére kell az sslmode=require változó, hogy beengedjen
const sequelize = new Sequelize(dbUrl.main, {
    logging: false //If you need more log, then enable this. Don't forget to reset it to false after you are done with development.
})

export { sequelize }
