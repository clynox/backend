import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/auth.routes";
import dataRouter from "./src/routes/data.routes";
import superAdminRouter from "./src/routes/super-admin.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());


app.set("trust proxy", true);
app.set("subdomain offset", 1);

app.use("/auth", authRouter);
app.use("/data", dataRouter);
app.use("/super-admin", superAdminRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
