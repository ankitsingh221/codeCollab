import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import { userInvitationRouter } from "./routes/invitationRoutes.js";
import { socketAuthMiddleware } from "./socket/socketAuth.js";
import { registerSocketHandlers } from "./socket/registerSocketHandlers.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/invitations", userInvitationRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
  maxHttpBufferSize: 5e6, // allow larger payloads for Yjs binary sync updates
});

io.use(socketAuthMiddleware);
registerSocketHandlers(io);


app.set("io", io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));