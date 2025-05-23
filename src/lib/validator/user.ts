import z from 'zod';

export const selfSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  date_joined: z.string().nullish(),
  is_superuser: z.boolean().nullish(),
  is_owner: z.boolean().nullish(),
  expiry_time: z.string().nullish(),
});
export type Self = z.infer<typeof selfSchema>;