export type Result<T> = { ok: true; body: T } | { ok: false; error: string };

export type ValidationResult =
  | { succeed: true; message: null }
  | { succeed: false; message: string };