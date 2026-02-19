import type { ZodError } from "zod";
import type { ErrorProps } from "@/types";

type ErrorParam = string | ErrorProps | (string | ErrorProps)[];

export class WavePollError extends Error {
  status: number;
  readonly #error: ErrorParam;

  constructor(status: number, error: ErrorParam) {
    const param = Array.isArray(error) ? error[0] : error;

    super(
      typeof param === "string" ? param : (param?.message ?? "Unknown error")
    );

    Object.setPrototypeOf(this, WavePollError.prototype);

    this.name = "WavePollError";
    this.status = status;
    this.#error = error;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static BadRequest(error: ErrorParam) {
    return new WavePollError(400, error);
  }

  static Unauthorrized(error: ErrorParam = "Not authorized") {
    return new WavePollError(401, error);
  }

  static NotFound(error: ErrorParam) {
    return new WavePollError(404, error);
  }

  static Conflict(error: ErrorParam) {
    return new WavePollError(409, error);
  }

  static UnprocessableEntity(error: ErrorParam) {
    return new WavePollError(422, error);
  }

  static Zod(error: ZodError) {
    return new WavePollError(
      422,
      error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join(".")
      }))
    );
  }

  static InternalServerError(
    error: ErrorParam = "An internal server error occurred"
  ) {
    return new WavePollError(500, error);
  }

  serialize(): ErrorProps[] {
    if (Array.isArray(this.#error))
      return this.#error.map((error) =>
        typeof error === "string" ? { message: error } : error
      );

    if (typeof this.#error === "string") return [{ message: this.#error }];

    return [this.#error];
  }
}
