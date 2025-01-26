export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly rawMessage?: string,
  ) {
    super(`[${statusCode}] ${rawMessage}`);
  }
}
