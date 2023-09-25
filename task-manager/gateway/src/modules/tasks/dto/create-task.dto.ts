import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  Length,
  IsPositive,
  IsDefined,
} from 'class-validator';
import { TaskStatus } from 'src/modules/tasks/utils/task.enum';

export class CreateTaskDto {
  @ApiProperty()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 100, {
    message: 'Title must be between 1 and 100 characters',
  })
  title: string;

  @ApiProperty()
  @IsString({ message: 'Description must be a string' })
  @Length(1, 255, {
    message: 'Description must be between 1 and 255 characters',
  })
  description: string;

  @ApiProperty()
  //status property has a certain values, specified by the "TaskStatus" enum
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  @IsNotEmpty({ message: 'Status is required' })
  @Length(1, 15, {
    message: 'Status must be between 1 and 15 characters',
  })
  status: string;

  @ApiProperty()
  @IsInt({ message: 'User ID must be an integer' })
  @IsDefined({ message: 'User ID is required' })
  @IsPositive({ message: 'User ID must be a positive integer' })
  user: number;
}
