import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class AppController {
  @Version('1')
  @Get()
  getHealthCheck() {
    return 'Microservice HTTP UP!';
  }
}
