const express = require("express");
require("dotenv").config();
const connectToDB = require("./helpers/connectToDB");
const verifyToken = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const categoryRouter = require("./routes/category");

const app = express();
const port = process.env.PORT || 5050;

connectToDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// logger middleware
app.use((req, _, next) => {
  console.log(`Request ${req.method} at ${req.url}`);
  next();
});

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/admin/category", categoryRouter);

app.get("/", (req, res) => {
  res.send(jwt.verify(req.body.token, process.env.JWT_SECRET));
});

app.get("/seed", async (req, res) => {
  // remove all the accounts in Admin collection and create a new admin with username: admin and password: admin
  const Admin = require("./models/Admin");
  await Admin.deleteMany({});

  const admin = new Admin({
    username: "admin",
    password: bcrypt.hashSync("admin", 10),
  });
  await admin.save();

  res.send("Seeding completed successfully");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
