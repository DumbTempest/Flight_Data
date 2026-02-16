"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const status_1 = __importDefault(require("./routes/status"));
const register_1 = __importDefault(require("./routes/register"));
const login_1 = __importDefault(require("./routes/login"));
const verify_1 = __importDefault(require("./routes/verify"));
const mongodb_1 = require("./lib/mongodb");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/status", status_1.default);
app.use("/api/auth/registerUser", register_1.default);
app.use("/api/auth/loginUser", login_1.default);
app.use("/api/auth/verify", verify_1.default);
app.listen(4000, async () => {
    console.log(`🚀 Express TS server running on port 4000`);
    await (0, mongodb_1.connectDB)();
});
//# sourceMappingURL=server.js.map