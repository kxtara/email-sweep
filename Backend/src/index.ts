import dotenv from "dotenv";
import express from "express";
import router from "./routes/routes";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Missing Google API credentials in .env");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Connect to Gmail: http://localhost:${PORT}/auth`);
});
