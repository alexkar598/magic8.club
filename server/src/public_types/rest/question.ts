import { z } from "zod";
import { entityId } from "../_base.ts";

export const questionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  author: entityId,
  askedAt: z.date(),
});
export type Question = z.infer<typeof questionSchema>;

export const questionPostSchema = questionSchema.pick({ text: true });
export type QuestionPost = z.infer<typeof questionPostSchema>;
