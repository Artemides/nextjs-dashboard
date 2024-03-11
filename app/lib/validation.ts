import { z } from 'zod';

export const SigninSchema = z.object({
  email: z
    .string({ required_error: 'Please enter your email' })
    .email('Please enter a valid email'),
  password: z.string({ required_error: 'Please enter your password' }),
});
