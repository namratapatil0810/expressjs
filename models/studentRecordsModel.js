const Sequelize = require('sequelize');
const sequelizedb = require("../util/database");

const StudentRecords = sequelizedb.define('studentRecords', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    studentId: {
        type: Sequelize.STRING,
    },
    std: {
        type: Sequelize.STRING,
        default: null
    },
    remark: {
        type: Sequelize.STRING,
        default: null
    },
    percentage: {
        type: Sequelize.STRING,
        default: null
    }
});

StudentRecords.sync({ alter: true }).then(() => {
    console.log('StudentRecords Table Syncesd');
});


module.exports = { StudentRecords };