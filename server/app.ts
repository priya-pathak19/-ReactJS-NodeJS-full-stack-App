import workflowRoutes from "./routes/workflowRoutes";
import cors from "cors";
import "dotenv/config";

const express = require("express");
// const morgan = require("morgan");

const mongoose = require("mongoose");
// const blogRoutes = require("./routes/blogRoutes");

// express app
// const app = express();

// connect to mongodb & listen for requests
// const dbURI =
//   "mongodb+srv://priya-19:123456priya@cluster0.nh0urni.mongodb.net/?appName=Cluster0";

// mongoose
//   .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then((result) => app.listen(3000))
//   .catch((err) => console.log(err));

// ----register view engine----
// app.set("view engine", "ejs");

// middleware & static files
// app.use(express.static("public"));
// app.use(express.urlencoded({ extended: true }));

// app.use(morgan("dev"));

// // routes
// app.get("/", (req, res) => {
//   res.redirect("/blogs");
// });

// app.get("/about", (req, res) => {
//   res.render("about", { title: "About" });
// });

// // blog routes
// app.use("/blogs", blogRoutes);

// // 404 page
// app.use((req, res) => {
//   res.status(404).render("404", { title: "404" });
// });

// -----Full stack with react api routes-----
const app = express();

// const dbURI =
//   "mongodb+srv://priya-19:123456priya@cluster0.nh0urni.mongodb.net/?appName=Cluster0";

// mongoose
//   .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then((result) => app.listen(3000))
//   .catch((err) => console.log(err));

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.use(express.urlencoded({ extended: true }));
// If a request contains JSON in its body, read it and convert it into a JavaScript object.
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend 👋" });
});

app.use("/api/workflow", workflowRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
