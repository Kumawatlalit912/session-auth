const express = require("express");
const app = express();
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
app.use(express.json());
const mongoUri =
  "mongodb+srv://manage:1234@cluster0.863eudz.mongodb.net/?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (e) {
    console.log(e);
  }
};
connectDB();

const store = new mongodbSession({
  uri: mongoUri,
  collection: "mySessions",
});
app.set("view engine", "ejs");
app.use(
  session({
    secret: "kumawat1234",
    resave: false, //*for each session ,we want to create new session,it does not matter if its the same user or not
    saveUninitialized: true,
    store: store,
  })
);
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  res.render("landing");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;
  const passkey = await bcrypt.hash(password, 12);
  const isExists = await User.findOne({ email });
  if (isExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const user = await User.create({
    username,
    email,
    password: passkey,
  });
  await user.save();
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      alert("invalid cred");
      return res.redirect("/login");
    }
    req.session.isAuth = true;
    res.redirect("/dashboard");
    // return res.status(200).json({ message: "Login successful" });

    // return res.status(400).json({ message: "Invalid credentials" });
  } else return res.status(400).json({ message: "Invalid credentials" });
});
app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard");
});
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
