import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@app/handler/exception.handler';
import LoggerService from '@app/utils/logger.utils';
import { HTTP_STATUS } from '@app/const/http-status.const';

class ErrorHandler {
  private static instance: ErrorHandler;
  private logger = LoggerService.getInstance();
  private readonly tag = 'ErrorHandler';

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError = (error: HttpException, _req: Request, res: Response, next: NextFunction): void => {
    try {
      const status: number = error.status || HTTP_STATUS.BAD_REQUEST;
      const message: string = error.message || 'Something went wrong';
      const errors: string | string[] = error.errors || 'Something went wrong';

      this.logger.warn({
        message: message,
        tag: this.tag,
        error,
      });

      res.status(status).json({ message, errors });
    } catch (err) {
      next(err);
    }
  };
}

export default ErrorHandler;
