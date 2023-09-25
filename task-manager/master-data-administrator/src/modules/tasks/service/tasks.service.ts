import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { FindTaskDto } from '../dto/find-task.dto';
import { User } from '../../users/entities/user.entity';
import { CustomException } from '../../../utils/custom-exception';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(taskDTO: CreateTaskDto): Promise<FindTaskDto> {
    // Conver from DTO to entity
    const taskEntity = plainToInstance(Task, taskDTO);
    // Register the entity in the DB
    const taskCreated = await this.taskRepository.save(taskEntity);
    // Return the object created as a DTO
    return plainToInstance(FindTaskDto, taskCreated);
  }

  async findAll(): Promise<FindTaskDto[]> {
    const tasks = await this.taskRepository.find({ relations: ['user'] });
    // Convert to DTO and return to the controller
    return tasks.map((task) => plainToInstance(FindTaskDto, task));
  }

  async findOne(id: number): Promise<FindTaskDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new CustomException(
        `Task not found with id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    // Convert to DTO and return to the controller
    return plainToInstance(FindTaskDto, task);
  }

  async update(
    userId: number,
    taskId: number,
    taskDTO: UpdateTaskDto,
  ): Promise<FindTaskDto> {
    const taskSearched = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['user'],
    });

    if (!taskSearched) {
      throw new CustomException(
        `Task not found with id ${taskId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    // Verify if the user is authorized to modify the task
    if (taskSearched.user.id !== parseInt(userId.toString())) {
      throw new CustomException(
        'You are not authorized to update this task',
        HttpStatus.FORBIDDEN,
      );
    }

    taskSearched.title = taskDTO.title;
    taskSearched.status = taskDTO.status;
    taskSearched.description = taskDTO.description;
    // We need to search that the user exist on database before to update the task, using coalescing operator
    taskSearched.user =
      (await this.userRepository.findOne({
        where: { id: taskDTO.user },
      })) ?? taskSearched.user;

    // Update the task and return the task updated (as DTO)
    return plainToInstance(
      FindTaskDto,
      await this.taskRepository.save(taskSearched),
    );
  }

  async remove(taskId: number, userId: number): Promise<boolean> {
    const taskSearched = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['user'],
    });

    if (!taskSearched) {
      throw new CustomException(
        `Task not found with id ${taskId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify if the user is authorized to delete the task
    if (taskSearched.user.id !== parseInt(userId.toString())) {
      throw new CustomException(
        'You are not authorized to delete this task',
        HttpStatus.FORBIDDEN,
      );
    }

    return !!(await this.taskRepository.remove(taskSearched));
  }
}
