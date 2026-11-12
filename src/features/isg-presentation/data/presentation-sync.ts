import { z } from "zod";
import { SLIDES } from "../content/slides";
const slideId = z.string().refine((id) => SLIDES.some((s) => s.id === id));
export const syncMessageSchema = z.discriminatedUnion("type", [
  z.object({ v: z.literal(1), type: z.literal("hello") }).strict(),
  z.object({ v: z.literal(1), type: z.literal("navigate"), slideId }).strict(),
  z
    .object({
      v: z.literal(1),
      type: z.literal("state"),
      slideId,
      mode: z.enum(["slides", "reading"]),
      sourceKind: z
        .enum(["historical_report", "current_aggregate", "synthetic_demo"])
        .nullable(),
    })
    .strict(),
]);
export const isChannelId = (id: string | null): id is string =>
  !!id &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
export const channelName = (id: string) => `isg-presentation-${id}`;
