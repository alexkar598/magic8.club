import express from "express";

const router = express.Router();

router.post("/search", (await import("./search.post.ts")).default);
router.post("/answer", (await import("./answer.post.ts")).default);

export default router;
