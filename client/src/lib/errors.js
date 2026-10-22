export class ApiError extends Error {
  constructor(payload) {
    super(payload.status);
    this.body = payload;
  }
}

export function isUnauthenticatedError(error) {
  return (
    error instanceof ApiError &&
    error.body?.errors?.[0]?.type === "UNAUTHENTICATED"
  );
}
