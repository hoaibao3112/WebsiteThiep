export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(public readonly status: number, message: string, public readonly code?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = status;
  }
}
