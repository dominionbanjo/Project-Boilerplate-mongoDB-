require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

//Packages
const morgan = require("morgan");

const connectDB = require("./db/connect");
const notFound = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

//imports
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("./db/cloudinary");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

//routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(fileUpload({ useTempFiles: true }));

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

//errors
app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
