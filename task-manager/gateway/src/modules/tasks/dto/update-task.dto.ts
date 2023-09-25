import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsPositive,
  IsInt,
  IsDefined,
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
} from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../utils/task.enum';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty()
  @IsInt({ message: 'ID must be an integer' })
  @IsDefined({ message: 'ID is required' })
  @IsPositive({ message: 'ID must be a positive integer' })
  id: number;

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
