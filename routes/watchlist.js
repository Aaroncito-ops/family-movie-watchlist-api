import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie
} from "../utils/db.js";

const router = express.Router();

router.use(authenticate);

router.get("/:userId", (req, res) => {
  const watchlist = getWatchlist(Number(req.params.userId));

  if (watchlist === null) {
    return res.status(404).json({
      error: "User not found."
    });
  }

  res.json({ watchlist });
});

router.post("/:userId/movies", authorizeModification, (req, res) => {
  const { title, genre } = req.body ?? {};

  if (
    typeof title !== "string" || !title.trim() ||
    (genre !== undefined && typeof genre !== "string")
  ) {
    return res.status(400).json({
      error: "A valid movie title and genre are required."
    });
  }

  const movie = addMovie(Number(req.params.userId), {
    title,
    genre: genre ?? ""
  });

  if (!movie) {
    return res.status(404).json({
      error: "User not found."
    });
  }

  res.status(201).json({ movie });
});

router.put("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const body = req.body ?? {};
  const updates = {};

  for (const field of ["title", "genre"]) {
    if (Object.hasOwn(body, field)) {
      if (
        typeof body[field] !== "string" ||
        (field === "title" && !body[field].trim())
      ) {
        return res.status(400).json({
          error: "Invalid movie data."
        });
      }

      updates[field] = body[field];
    }
  }

  if (Object.hasOwn(body, "watched")) {
    if (typeof body.watched !== "boolean") {
      return res.status(400).json({
        error: "watched must be a boolean."
      });
    }

    updates.watched = body.watched;
  }

  const movie = updateMovie(
    Number(req.params.userId),
    Number(req.params.movieId),
    updates
  );

  if (!movie) {
    return res.status(404).json({
      error: "User or movie not found."
    });
  }

  res.json({ movie });
});

router.delete("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const removed = deleteMovie(
    Number(req.params.userId),
    Number(req.params.movieId)
  );

  if (!removed) {
    return res.status(404).json({
      error: "User or movie not found."
    });
  }

  res.json({
    message: "Movie deleted successfully."
  });
});

export default router;
