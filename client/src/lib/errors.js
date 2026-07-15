export class ApiError extends Error {
  constructor(payload) {
    super(payload.status);
    this.body = payload;
  }
}
