import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientPointsException extends HttpException {
  constructor(requiredPoints: number, availablePoints: number) {
    super(
      {
        message: 'Insufficient points for redemption',
        error: 'Insufficient Points',
        requiredPoints,
        availablePoints,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
} 