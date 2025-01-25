import express from "express";

const router = express.Router();

router.post("/", (await import("./post")).default);

export default router;
