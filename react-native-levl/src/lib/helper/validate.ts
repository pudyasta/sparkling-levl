import { type ObjectSchema, ValidationError } from 'yup';

export async function validateSafely<T extends object>(
  schema: ObjectSchema<any>,
  data: T
): Promise<{ success: true } | { success: false; errors: Record<string, string> }> {
  try {
    await schema.validate(data, { abortEarly: false });
    return { success: true };
  } catch (err) {
    if (err instanceof ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((e) => {
        if (e.path) errors[e.path] = e.message;
      });
      return { success: false, errors };
    }
    throw err;
  }
}
