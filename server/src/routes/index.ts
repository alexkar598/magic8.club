import express from "express";

const router = express.Router();

router.use("/question", (await import("./question")).default);

export const appRouter = router;
