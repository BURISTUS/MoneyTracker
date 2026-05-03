import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Application exception with i18n support.
 * 
 * Usage:
 *   throw new AppException('errors.insufficientFunds', 400, { available: '500', needed: '2000' });
 * 
 * The ExceptionFilter translates the key using the request's locale.
 */
export class AppException extends HttpException {
  public readonly i18nKey: string;
  public readonly i18nParams: Record<string, unknown>;

  constructor(
    key: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    params: Record<string, unknown> = {},
  ) {
    super(key, status);
    this.i18nKey = key;
    this.i18nParams = params;
  }
}
