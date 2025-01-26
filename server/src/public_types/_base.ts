import { z } from "zod";

export const entitySchema = z.object({
  id: z.string().uuid(),
});

export const entityId = entitySchema.transform((x) => x.id).or(z.string());
