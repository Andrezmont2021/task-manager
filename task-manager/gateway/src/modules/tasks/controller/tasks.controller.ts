import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Inject,
  UseGuards,
  Version,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { FindTaskDto } from '../dto/find-task.dto';
import { ErrorModel } from 'src/modules/models/error.model';
import { manageException } from 'src/utils/exception.utils';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TasksController {
  /**
   * Each endpoint send the information to the microservice return the result (if all its ok)
   * and return the http errors with the status code received or 500
   */
  constructor(
    @Inject('ADMINISTRATOR_MICROSERVICE')
    private readonly clientAdministratorService: ClientProxy,
  ) {}

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() taskDTO: CreateTaskDto) {
    let result: FindTaskDto | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('createTask', taskDTO),
      );
    } catch (error) {
      manageException(error);
    }

    if (typeof result === 'object' && 'error' in result && result.error) {
      manageException(result);
    }

    return result;
  }

  @Version('1')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    let result: FindTaskDto[] | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('findAllTasks', ''),
      );
    } catch (error) {
      manageException(error);
    }

    if (typeof result === 'object' && 'error' in result && result.error) {
      manageException(result);
    }

    return result;
  }

  @Version('1')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    let result: FindTaskDto | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('findOneTask', id),
      );
    } catch (error) {
      manageException(error);
    }

    if (typeof result === 'object' && 'error' in result && result.error) {
      manageException(result);
    }

    return result;
  }

  @Version('1')
  @Put()
  @HttpCode(HttpStatus.OK)
  async update(
    @Query('userId') userId: string,
    @Body() taskDTO: UpdateTaskDto,
  ) {
    let result: FindTaskDto | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('updateTask', {
          userId,
          task: taskDTO,
        }),
      );
    } catch (error) {
      manageException(error);
    }

    if (typeof result === 'object' && 'error' in result && result.error) {
      manageException(result);
    }

    return result;
  }

  @Version('1')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Query('userId') userId: string) {
    let result: boolean | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('removeTask', {
          taskId: id,
          userId,
        }),
      );
    } catch (error) {
      manageException(error);
    }

    if (typeof result === 'object' && 'error' in result && result.error) {
      manageException(result);
    }

    return result;
  }
}
