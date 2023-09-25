import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  id: number;
}

export class UpdateTaskUserDto {
  userId: number;
  task: UpdateTaskDto;
}
