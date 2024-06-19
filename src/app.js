import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
//Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" })); //optional
app.use(express.static("public"));
app.use(cookieParser());


app.get("/", (req, res) => {
  console.log("Inside Home");
  res.send("<h1>Hello!</h1>");
});


export default app;
