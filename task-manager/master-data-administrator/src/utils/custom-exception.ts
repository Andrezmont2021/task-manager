import { RpcException } from '@nestjs/microservices';

export class CustomException extends RpcException {
  code: number;
  constructor(message: string, code: number) {
    super({ message });
    this.code = code;
  }
}
