import { HttpStatus } from '@nestjs/common';

export class BusinessException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: Record<string, unknown> | Array<unknown>,
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}
