const express = require("express");
const session = require("express-session");
const SequelizeStorePkg = require("connect-session-sequelize");
const sequelize = require("./config/database.js");
const dotenv = require("dotenv");
const flashMessage = require("./app/middlewares/flash.js");
const csurf = require("csurf");

dotenv.config();

const app = express();

const userRoutes = require("./routes/user.js");
const authRoutes = require("./routes/auth.js");
const flashMessage = require("./app/middlewares/flash.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(flashMessage);

const SequelizeStore = SequelizeStorePkg(session.Store);

const store = new SequelizeStore({
  db: sequelize,
});

store.sync();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(csurf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next(err);
});
app.use("/user", userRoutes);
app.use("/auth", authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
