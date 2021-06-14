const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelizedb = require("../util/database");
const { StudentRecords } = require('./studentRecordsModel');

const StudentSchema = sequelizedb.define('studentData', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        default: null
    },
    rollno: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    emailId: {
        type: Sequelize.STRING,
        default: null,
    },
    password: {
        type: Sequelize.STRING,
        default: null
    },
    std: {
        type: Sequelize.INTEGER,
        default: null
    }
});

StudentSchema.beforeSave((model, options) => {
    try {
        if (!model.password) return true;
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(model.password, salt);
        model.password = hash;
        return true;
    } catch (err) {
        if (err) return false;
    }
});
StudentSchema.hasMany(StudentRecords, {
    foreignKey: "studentId"
});

StudentRecords.belongsTo(StudentSchema, { as: 'student', constraints: false });
StudentSchema.sync({ alter: true }).then(() => {
    console.log('Student Table Syncesd');
});

module.exports = { StudentSchema };