import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  catch(exception: BusinessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.status;

    response.status(status).json({
      code: exception.code,
      message: exception.message,
      details: exception.details || null,
      timestamp: new Date().toISOString(),
    });
  }
}
