import type { TFunction } from 'i18next';
import z from 'zod';

// form validation
export function createLoginFormInputSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t('auth:form.validation.email.required')),
    password: z.string().min(1, t('auth:form.validation.password.required')),
  });
}
export type LoginFormInput = z.infer<
  ReturnType<typeof createLoginFormInputSchema>
>;

export type LoginPayload = {
  email: string;
  password: string;
};

export const loginResponseSchema = z.object({
  token: z.string(),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;