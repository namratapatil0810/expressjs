const User = require('../models/studentModel').StudentSchema;
const StudentRecords = require('../models/studentRecordsModel').StudentRecords;

exports.getStudentDetails = (rollId, callback) => {
    User.findAll({
        where: { rollno: rollId },
        include: [{
            model: StudentRecords, as: 'studentRecords',
            attributes: [
                "std", "remark", "percentage"
            ]
        }],
        attributes: ["rollno", "emailId", "std", "name"],
        raw: true
    }).then(data => {
        if (data.length) {
            var studentData = {
                rollno: data[0].rollno,
                emailId: data[0].emailId,
                std: data[0].std,
                name: data[0].name
            }
            if (studentData.std > 1) {
                studentData.studentData = [];
                studentData.studentData = data.map(each => {
                    return {
                        std: each['studentRecords.std'],
                        remark: each['studentRecords.remark'],
                        percentage: each['studentRecords.percentage'],
                    }
                });
            }
        }
        callback(null, studentData);
    }).catch(e => {
        callback(e, null);
    });

};