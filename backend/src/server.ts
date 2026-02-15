import express, { Application } from "express";
import cors from "cors";

import statusRoutes from "./routes/status";
import registerRoutes from "./routes/register";
import loginRoutes from "./routes/login";
import verifyRoutes from "./routes/verify";
import { connectDB } from "./lib/mongodb";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/status", statusRoutes);
app.use("/api/auth/registerUser", registerRoutes);
app.use("/api/auth/loginUser", loginRoutes);
app.use("/api/auth/verify", verifyRoutes);

app.listen(3001, async () => {
    console.log(`🚀 Express TS server running on port 3001`);
    await connectDB();
});
