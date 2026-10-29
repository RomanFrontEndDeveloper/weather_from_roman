import express from "express";
import cors from "cors";
import weatherRouter from "./routes/weather.routes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", weatherRouter);

app.listen(PORT, () => {
  console.log(`WeatherPulse API running at http://localhost:${PORT}`);
});
