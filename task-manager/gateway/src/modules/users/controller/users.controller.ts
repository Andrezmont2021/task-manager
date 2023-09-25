import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuards,
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ErrorModel } from 'src/modules/models/error.model';
import { UpdateUserDto } from '../dto/update-user.dto';
import { manageException } from 'src/utils/exception.utils';

@ApiTags('users')
@Controller('users')
export class UsersController {
  /**
   * Each endpoint send the information to the microservice return the result (if all its ok)
   * and return the http errors with the status code received or 500
   */
  constructor(
    @Inject('ADMINISTRATOR_MICROSERVICE')
    private readonly clientAdministratorService: ClientProxy,
  ) {}

  @Version('1')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userDTO: CreateUserDto) {
    let result: UpdateUserDto | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('createUser', userDTO),
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
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() userDTO: LoginUserDto) {
    let result: { access_token: string } | ErrorModel;
    try {
      result = await lastValueFrom(
        this.clientAdministratorService.send('login', userDTO),
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
