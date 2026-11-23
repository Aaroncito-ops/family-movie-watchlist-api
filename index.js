import express from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Family Movie Watchlist API");
});

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(
    "Family Movie Watchlist API running at http://localhost:" + PORT
  );
});
