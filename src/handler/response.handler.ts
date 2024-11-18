import { HTTP_STATUS } from '@app/const/http-status.const';

export class HttpResponse {
  message: string;
  data: any;
  statusCode: number;

  constructor(message: string, data: any, statusCode = HTTP_STATUS.OK) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}
