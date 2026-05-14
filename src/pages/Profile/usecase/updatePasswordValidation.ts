import * as yup from 'yup';

export const UpdatePassSchema = yup.object({
  current_password: yup.string().required(),
  new_password: yup
    .string()
    .matches(/([@$!%*?&\-_])/, 'Password must contain a special character')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .min(8, 'Password must be at least 8 characters long'),

  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export type UpdatePassSchema = yup.InferType<typeof UpdatePassSchema>;
