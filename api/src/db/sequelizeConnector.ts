
import { Sequelize } from 'sequelize'

const dbUrl: any = {
    
    //deploy-hoz!
    main: 'postgres://gergocs@ep-solitary-surf-336790.eu-central-1.aws.neon.tech/neondb',

    //tesztelőkenk
    test: 'postgres://gergocs@ep-icy-sound-866375.eu-central-1.aws.neon.tech/neondb',

    //ha egy táblát módosítani kell akkor ezen a branchen történjen.
    modifyTableTest: 'postgres://gergocs@ep-plain-leaf-175928.eu-central-1.aws.neon.tech/neondb',

    //ha új tábla kell akkor ezen a branchen próbáljátok ki
    newTableTest : 'postgres://gergocs@ep-silent-union-783120.eu-central-1.aws.neon.tech/neondb',

    //frontendeseknek ami már a backendnél megy és kész arra, hogy a frontend használja
    testForFrontend :'postgres://gergocs@ep-red-hall-293800.eu-central-1.aws.neon.tech/neondb'
}

//URL végére kell az sslmode=require változó, hogy beengedjen
const sequelize = new Sequelize(dbUrl.modifyTableTest + '?sslmode=require')

export { sequelize }