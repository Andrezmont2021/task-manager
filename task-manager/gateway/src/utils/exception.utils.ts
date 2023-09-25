import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorModel } from 'src/modules/models/error.model';

export const manageException = (errorResult: ErrorModel | any) => {
  const isCodeNumber = typeof errorResult.code === 'number';
  throw new HttpException(
    errorResult.message,
    isCodeNumber ? errorResult.code : HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
