import { z } from "zod";
import { entityId } from "../_base.ts";

export const answerSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  author: entityId,
  question: entityId,
  answeredAt: z.date(),
});
export type Answer = z.infer<typeof answerSchema>;

export const answerPostSchema = answerSchema.pick({
  text: true,
  question: true,
});
export type AnswerPost = z.infer<typeof answerPostSchema>;
