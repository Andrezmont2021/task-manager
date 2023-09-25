import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from '../service/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskUserDto } from '../dto/update-task.dto';
import { ErrorModel } from 'src/models/error.model';
import { FindTaskDto } from '../dto/find-task.dto';
import { RemoveTaskUserDto } from '../dto/remove-task.dto';
import { manageException } from 'src/utils/exception.utils';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('createTask')
  async create(
    @Payload() createTaskDto: CreateTaskDto,
  ): Promise<FindTaskDto | ErrorModel> {
    try {
      return await this.tasksService.create(createTaskDto);
    } catch (error) {
      return manageException(error);
    }
  }

  @MessagePattern('findAllTasks')
  async findAllTasks(): Promise<FindTaskDto[] | ErrorModel> {
    try {
      return await this.tasksService.findAll();
    } catch (error) {
      return manageException(error);
    }
  }

  @MessagePattern('findOneTask')
  async findOne(@Payload() id: number): Promise<FindTaskDto | ErrorModel> {
    try {
      return await this.tasksService.findOne(id);
    } catch (error) {
      return manageException(error);
    }
  }

  @MessagePattern('updateTask')
  async update(
    @Payload() data: UpdateTaskUserDto,
  ): Promise<FindTaskDto | ErrorModel> {
    try {
      return await this.tasksService.update(
        data.userId,
        data.task.id,
        data.task,
      );
    } catch (error) {
      return manageException(error);
    }
  }

  @MessagePattern('removeTask')
  async remove(
    @Payload() data: RemoveTaskUserDto,
  ): Promise<boolean | ErrorModel> {
    try {
      return await this.tasksService.remove(data.taskId, data.userId);
    } catch (error) {
      return manageException(error);
    }
  }
}
