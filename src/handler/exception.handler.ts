import { HTTP_STATUS } from '@app/const/http-status.const';

export class HttpException extends Error {
  public readonly status: number;
  public readonly message: string;
  public readonly errors: string | string[];
  public readonly timestamp: string;

  constructor(
    status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: string = 'An unexpected error occurred',
    errors: string | string[] = [],
  ) {
    super(message);

    this.status = status;
    this.message = message;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.timestamp = new Date().toISOString();
  }

  public toJSON(): Record<string, unknown> {
    return {
      status: this.status,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp,
    };
  }
}
