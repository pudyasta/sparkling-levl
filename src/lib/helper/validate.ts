import { ObjectSchema, ValidationError, type InferType } from 'yup';

type ValidationResult<T> =
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: Record<string, string> };

export async function validateSafely<T extends ObjectSchema<any>>(
  schema: T,
  values: any,
): Promise<ValidationResult<InferType<T>>> {
  try {
    const data = await schema.validate(values, { abortEarly: false });
    return { success: true, data, errors: null };
  } catch (err) {
    if (err instanceof ValidationError) {
      const errors = err.inner.reduce(
        (acc, curr) => {
          if (curr.path) acc[curr.path] = curr.message;
          return acc;
        },
        {} as Record<string, string>,
      );

      return { success: false, data: null, errors };
    }
    // Fallback for non-validation runtime errors
    throw err;
  }
}
