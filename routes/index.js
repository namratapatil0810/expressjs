const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { login, logOut } = require("../controllers/studentController");

router.get("/", (req, res, next) => {
    res.redirect('/login');
});
router.get("/login", studentController.getLogin);
router.get("/registration", studentController.getregistration);
router.get("/getStudentDetails", studentController.getAllStudentDetails);


router.post("/login", login);
router.post("/logout", logOut);
router.post("/addStudent", studentController.addStudent);

module.exports = router;
