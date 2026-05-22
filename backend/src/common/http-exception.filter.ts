import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';
import { AppException } from './app-exception';

/**
 * Unified error response format.
 * All errors follow this shape with i18n-translated messages.
 */
export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(I18nService) private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ headers: Record<string, string> }>();

    const lang =
      request.headers?.['accept-language'] ||
      request.headers?.['Accept-Language'] ||
      'en';

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      try {
        message = await this.i18n.translate(exception.i18nKey, {
          lang,
          args: exception.i18nParams,
        });
      } catch {
        message = exception.i18nKey;
      }
      if (exception.i18nParams && Object.keys(exception.i18nParams).length > 0) {
        for (const [k, v] of Object.entries(exception.i18nParams)) {
          message = message.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
          message = message.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      error = HttpStatus[status] || 'Error';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as Record<string, unknown>;
        message = Array.isArray(resp.message)
          ? (resp.message as string[]).join('; ')
          : String(resp.message ?? exception.message);
      } else {
        message = exception.message;
      }
      error = HttpStatus[status] || exception.name;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = 'Internal Server Error';
      console.error('Unhandled exception:', exception);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error';
      error = 'Internal Server Error';
    }

    const body: ApiError = {
      success: false,
      statusCode: status,
      error,
      message,
    };

    response.status(status).json(body);
  }
}
