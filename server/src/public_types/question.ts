import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
});
export type Question = z.infer<typeof questionSchema>;

export const questionPostSchema = questionSchema.pick({ text: true });
export type QuestionPostSchema = z.infer<typeof questionPostSchema>;
