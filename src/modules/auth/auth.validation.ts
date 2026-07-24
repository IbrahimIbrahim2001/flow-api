import validator from 'validator';
import z from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z
    .string()
    .refine((v) => validator.isEmail(v), { message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine(
      (v: string) =>
        validator.isStrongPassword(v, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0,
        }),
      {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
    ),
});

export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email  address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});
