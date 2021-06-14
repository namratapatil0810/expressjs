const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require('express-session');
const cookieParser = require('cookie-parser')
const app = express();
const router = require("./routes/index");
const passport = require('passport');
const cors = require('cors');
const intializePassport = require('./config/passport-config.js');
const sequelizedb = require("./util/database");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(cookieParser('test'));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use((req, res, next) => {
    next();
});

//===SEQUELIZE  POOL ====
sequelizedb.authenticate()
    .then(() => console.log("connnected to DB successfully!!"))
    .catch(e => console.log(e))

app.use(session({
    secret: 'test',
    resave: true,
    saveUninitialized: false,
    cookie: {
        //  maxAge: null,
        httpOnly: true,
        secure: false
    }
}))

intializePassport(passport);
app.use(passport.initialize())
app.use(passport.session())

app.use(router);

app.listen(8000);
