const User = require('../models/studentModel').StudentSchema;
const StudentRecords = require('../models/studentRecordsModel').StudentRecords;
const passport = require('passport');
const { getStudentDetails } = require("../services/student");
const crypto = require('crypto');

exports.getLogin = (req, res, next) => {
    res.render("login", {
        data: {},
        pageTitle: "login",
        path: "/login"
    });
};

exports.getregistration = (req, res, next) => {
    res.render("registration", {
        data: {},
        pageTitle: "registration",
        path: "/registration"
    });
};

exports.login = async function (req, res, next) {
    const { emailId, password, type, } = req.body;

    if (!emailId || !password) {
        return res.send("enter fileds")
    }

    passport.authenticate('local', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/');
        }

    passport.authenticate("local", async function (err, user, info) {
        if (err) {
            return res.send("505")
        }

        if (user) {
            req.logIn(user, async (err) => {
                if (err) { return next(err); }

                getStudentDetails(user.rollno, (error, response) => {
                    if (response) {

                        req.session.user = req.user;

                        let maxAgeTime = new Date(Number(new Date()) + req.session.cookie.originalMaxAge);

                        //User Login success
                        let maxAge = {
                            expires: maxAgeTime
                        };
                        let token = crypto.createHash('sha256').update(user.id.toString()).digest("hex");
                        let userData = Buffer.from(JSON.stringify(user), "ascii").toString(
                            "base64"
                        );
                        res.cookie("user", userData); //maxAge
                        res.cookie("token", token); //maxAge

                        response.status = true;
                        return res.status(200).render("student-details", {
                            data: response,
                            pageTitle: "Student Details",
                            path: "/student-details"
                        });
                    } else {
                        var resData = {
                            message: "Something went wrong!",
                            status: false
                        }
                        res.status(500).render("login", {
                            data: resData,
                            pageTitle: "Login",
                            path: "/login"
                        });
                    }
                });
            });
        } else {
            var errorInfo = {
                message: info.message || "",
                status: false
            }
            res.status(401).render("login", {
                data: errorInfo,
                pageTitle: "Login",
                path: "/login"
            });
        }
    }
    )(req, res);
};

exports.addStudent = async (req, res, next) => {
    var userObj = {
        name: req.body.username,
        rollno: req.body.rollno,
        emailId: req.body.emailId,
        std: req.body.std,
        password: req.body.password

    }

    await User.create(userObj).then(async (response) => {
        if (response) {
            if (req.body.std > 1) {
                for (i = 1; i < req.body.std; i++) {
                    var studentRecord = {
                        studentId: response.id,
                        std: i,
                        remark: req.body[i + '_std_remark'],
                        percentage: req.body[i + '_std_percentage'],
                    }
                    await StudentRecords.create(studentRecord).then((studentData) => {
                        console.log("Record Added");
                    }).catch(e => {
                        console.log(e);
                        // var resData = {
                        //     message: "Something went wrong!",
                        //     status: false
                        // }
                        // res.status(500).render("registration", {
                        //     data: resData,
                        //     pageTitle: "registration",
                        //     path: "/registration"
                        // });
                    });
                    if ((i + 1) == req.body.std) {
                        res.status(200).redirect('/login');
                    }

                }
            } else {
                res.status(200).redirect('/login');
            }
        } else {
            var resData = {
                message: "Something went wrong!",
                status: false
            }
            res.status(500).render("registration", {
                data: resData,
                pageTitle: "registration",
                path: "/registration"
            });
        }
    }).catch(e => {
        if (e.errors && e.errors.length && e.errors[0].type == "unique violation") {
            var resData = {
                message: "You have Already Register. Try to login",
                status: false
            }
            res.status(409).render("registration", {
                data: resData,
                pageTitle: "registration",
                path: "/registration"
            });
        } else {
            var resData = {
                message: "Something went wrong!",
                status: false
            }
            res.status(500).render("registration", {
                data: resData,
                pageTitle: "registration",
                path: "/registration"
            });
        }
    });
};

exports.logOut = async function (req, res) {
    req.logout();
    req.session.destroy(function (err) {
        setTimeout(function () {
            res.clearCookie("user");
            res.clearCookie("token");
            console.log(req.user, "+req.user-logout");
            var resData = {
                message: "Logout Successful",
                status: true,
            }
            res.status(200).redirect('/login');
        }, 2500);
    });
};

exports.getAllStudentDetails = (req, res, next) => {

    User.findAll({
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
            var studentDetails = [];
            data.map(each => {
                var found = false;
                for (var i = 0; i < studentDetails.length; i++) {
                    if (studentDetails[i].rollno == each.rollno) {
                        if (each.std > 1) {
                            studentDetails[i].studentRecords.push({
                                std: each['studentRecords.std'],
                                remark: each['studentRecords.remark'],
                                percentage: each['studentRecords.percentage']
                            });
                        }
                        found = true;
                        break;
                    }
                }
                if (found == false) {
                    var studentData = {
                        rollno: each.rollno,
                        emailId: each.rollno,
                        std: each.std,
                        name: each.name
                    }
                    if (each.std > 1) {
                        studentData.studentRecords = []
                        studentData.studentRecords.push({
                            std: each['studentRecords.std'],
                            remark: each['studentRecords.remark'],
                            percentage: each['studentRecords.percentage']
                        });
                    }
                    studentDetails.push(studentData);
                }
            });
            res.json(studentDetails);
        } else {
            res.status(200).json({ message: "No data found!" });
        }
    }).catch(e => {
        res.status(500).json({ message: "Something wen wrong" });
    });

}