import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TasksController],
  imports: [
    //Maybe is not the better way, using the config module in each module, but i did not found a better option now
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'ADMINISTRATOR_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ADMINISTRATOR_MICROSERVICE_HOST,
          port: parseInt(process.env.ADMINISTRATOR_MICROSERVICE_PORT),
        },
      },
    ]),
  ],
})
export class TasksModule {}
