import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CryptoService } from 'src/utils/crypto.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ErrorModel } from 'src/models/error.model';
import { manageException } from 'src/utils/exception.utils';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CryptoService) private cryptoService: CryptoService,
  ) {}

  @MessagePattern('createUser')
  async create(
    @Payload() userDTO: CreateUserDto,
  ): Promise<UpdateUserDto | ErrorModel> {
    try {
      /** This log is basically to know what is the encrypted text that comes here if the password is "test1234",
       * is for testing purposes
       */
      console.log(
        'encrypting password to test',
        this.cryptoService.encrypt('test1234'),
      );
      return await this.usersService.create(userDTO);
    } catch (error) {
      return manageException(error);
    }
  }

  @MessagePattern('login')
  async login(
    @Payload() userDTO: LoginUserDto,
  ): Promise<{ access_token: string } | ErrorModel> {
    try {
      /** This log is basically to know what is the encrypted text that comes here if the password is "test1234",
       * is for testing purposes
       */
      console.log(
        'encrypting password to test',
        this.cryptoService.encrypt('test1234'),
      );
      return await this.usersService.login(userDTO);
    } catch (error) {
      return manageException(error);
    }
  }
}
