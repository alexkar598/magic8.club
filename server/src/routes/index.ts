import express from "express";

const router = express.Router();

router.use("/question", (await import("./question/index.ts")).default);
router.use(
  "/answer_question",
  (await import("./answer_question/index.ts")).default,
);

export const appRouter = router;
