import express from "express";

const router = express.Router();

router.post("/", (await import("./post.ts")).default);

export default router;
