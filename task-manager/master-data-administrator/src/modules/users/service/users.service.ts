import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CryptoService } from '../../../utils/crypto.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { CustomException } from '../../../utils/custom-exception';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CryptoService) private cryptoService: CryptoService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(userDTO: CreateUserDto): Promise<UpdateUserDto> {
    // Convert from DTO to entity
    const userEntity = plainToInstance(User, userDTO);

    /** IMPORTANT: Remember that is recommended that a password travels encrypted through the transport layer,
    so we need first to decrypt this encrypting 
    */
    const passwordDecrypted = this.cryptoService.decrypt(userEntity.password);

    /** IMPORTANT: Later, we need to hash the password so we can save in DB
     */
    const salt = await bcrypt.genSalt();
    userEntity.password = await bcrypt.hash(passwordDecrypted, salt);
    // Register the entity in the DB
    const userCreated = await this.userRepository.save(userEntity);
    // I dont want to show password on client side
    // Return the object created as a DTO
    return plainToInstance(UpdateUserDto, {
      id: userCreated.id,
      name: userCreated.name,
      email: userCreated.email,
    });
  }

  async login(userDTO: LoginUserDto): Promise<{ access_token: string }> {
    // Its important that the email is unique on the User entity
    const userFound = await this.userRepository.findOne({
      where: {
        email: userDTO.email,
      },
    });

    if (!userFound) {
      throw new CustomException('Invalid Email', HttpStatus.UNAUTHORIZED);
    }

    /** IMPORTANT: Remember that is recommended that a password travels encrypted through the transport layer,
    so we need first to decrypt this encrypting 
    */
    const passwordDecrypted = this.cryptoService.decrypt(userDTO.password);
    // Compare the hash in DB with the password on the request
    const isCorrectPassword = await bcrypt.compare(
      passwordDecrypted,
      userFound.password,
    );

    if (!isCorrectPassword) {
      throw new CustomException('Invalid Passsword', HttpStatus.UNAUTHORIZED);
    }
    // Return token with some user info like id, email and name
    const payload = {
      sub: userFound.id,
      email: userFound.email,
      name: userFound.name,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
