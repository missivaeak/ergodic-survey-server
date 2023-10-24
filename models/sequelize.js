import { Sequelize, DataTypes, Model } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: path.join(__dirname, '..', 'database', 'database.sqlite')
// });
const sequelize = new Sequelize('ergodic-survey', 'missivaeak', process.env.DATABASE_PASSWORD, {
    dialect: 'mssql',
    host: 'ergodic-survey-server.database.windows.net',
    dialectOptions: {}
});

class Chapter extends Model {}
class Response extends Model {}
class Demographic extends Model {}
class ResponseDemographics extends Model {}
class ResponseChapters extends Model {}

Chapter.init({
    title: {
        type: DataTypes.STRING
    },
    content: {
        type: DataTypes.TEXT
    }
    }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Chapter' // We need to choose the model name
});


Response.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        get() {
            return -1;
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Response', // We need to choose the model name
    indexes: [{
        unique: true,
        fields: ["code"]
    }]
})

Demographic.init({
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Demographic', // We need to choose the model name
})

ResponseDemographics.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        get() {
            return -1;
        }
    },
    value: {
        type: DataTypes.STRING
    }
}, {
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: 'ResponseDemographics', // We need to choose the model name
})

Response.belongsToMany(Demographic, { through: ResponseDemographics })
Demographic.belongsToMany(Response, { through: ResponseDemographics })

ResponseChapters.init({
    ResponseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        get() {
            return -1;
        }
    },
    time: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    viewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    checked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: 'ResponseChapters', // We need to choose the model name
})

Response.belongsToMany(Chapter, { through: ResponseChapters })
Chapter.belongsToMany(Response, { through: ResponseChapters })

async function authenticate() {
    try {
        await sequelize.authenticate();
        return 'Established.';
    } catch (error) {
        return 'Error:' + error;
    }
}

async function sync(mode="") {
    let param;

    if (mode === "force") {
        param = { force: true };
    } else if (mode === "alter") {
        param = { alter: true };
    }

    try {
        await sequelize.sync(param);
        return {
            success: true,
            mode: mode ? mode : ""
        };
    } catch (error) {
        return {
            success: false,
            data: error
        };
    }
}

export { sequelize, authenticate, sync, Chapter, Response, Demographic, ResponseChapters, ResponseDemographics };
