import * as yup from 'yup';

export const loginSchema = yup.object({
  login: yup
    .string()
    .min(5, 'Username must be at least 5 characters long')
    .required('Please enter a valid email address'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .required('Please enter your password'),
});

export type LoginSchema = yup.InferType<typeof loginSchema>;
