const express = require("express");
const app = express();
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");
const port = 3000;
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

app.use(
  session({
    secret: "kumawat1234",
    resave: false, //*for each session ,we want to create new session,it does not matter if its the same user or not
    saveUninitialized: true,
    store: store,
  })
);

app.get("/", (req, res) => {
  console.log(req.session.id);
  res.send("hello world");
});
app.post("/register", async (req, res) => {
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
  redirect("/login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.isAuth = true;
      redirect("/dashboard");
      return res.status(200).json({ message: "Login successful" });
    }
    return res.status(400).json({ message: "Invalid credentials" });
  }
  return res.status(400).json({ message: "Invalid credentials" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
