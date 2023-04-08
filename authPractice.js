const express = require("express");
const app = express();
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
