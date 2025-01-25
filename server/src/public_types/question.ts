import { z } from "zod";
import { entityId } from "./_base.ts";

export enum QuestionState {
  Unclaimed,
}

export const questionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  author: entityId,
  state: z.nativeEnum(QuestionState),
});
export type Question = z.infer<typeof questionSchema>;

export const questionPostSchema = questionSchema.pick({ text: true });
export type QuestionPostSchema = z.infer<typeof questionPostSchema>;
