import { z } from "zod";

const email = z.string().trim().min(1, "Informe seu e-mail.").email("Informe um e-mail válido.");
const newPassword = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo.").max(100, "Máximo de 100 caracteres."),
    email,
    institutionCode: z.number({ error: "Selecione sua unidade." }).int().positive("Selecione sua unidade."),
    courseId: z.string().min(1, "Selecione seu curso."),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({ password: newPassword, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ForgotForm = z.infer<typeof forgotSchema>;
export type ResetForm = z.infer<typeof resetSchema>;

/** Lê o token do fragmento da URL (#token=...), que não é enviado ao servidor nem vaza via Referer. */
export function tokenFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const token = params.get("token");
  return token && token.length >= 16 ? token : null;
}
