const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "Med1212809@",
  database: "db",
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let sendhash = () => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.log(err);
      }

      db.query(
        "INSERT INTO account (email, pwd) VALUES (?,?)",
        [username, hash],
        (err, result) => {
          console.log(err);
        }
      );
    });
  };
  db.query(
    "SELECT * FROM account WHERE email = ?;",
    username,
    (err, result) => {
      if (result.length > 0) {
        if (err) {
          throw err;
        }
        let isNewMail = result[0].email !== username;
        if (isNewMail) {
          sendhash();
        } else {
          res.send("this email is already in use!");
        }
      } else {
        sendhash();
      }
    }
  );
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM account WHERE email = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].pwd, (error, response) => {
          console.log(response);
          console.log(result[0].pwd);
          console.log(password);
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send(result);
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

app.listen(3001, () => {
  console.log("running server");
});
