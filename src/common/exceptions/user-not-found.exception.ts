import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(
      {
        message: `User with ID ${userId} not found`,
        error: 'User Not Found',
        userId,
      },
      HttpStatus.NOT_FOUND,
    );
  }
} 