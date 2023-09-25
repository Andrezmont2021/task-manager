import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { CryptoService } from '../../../utils/crypto.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

describe('UserService', () => {
  let userService: UsersService;
  let cryptoService: CryptoService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  const mockCryptoService = {
    decrypt: jest.fn(),
  };

  const mockJWTService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: JwtService,
          useValue: mockJWTService,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    cryptoService = module.get<CryptoService>(CryptoService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'testuser',
        password: 'ecdbbb31b42c8ce3c6afcbc85abe37ba',
        name: 'test',
      };

      const decryptedPassword = 'test1234';

      mockCryptoService.decrypt.mockReturnValue(decryptedPassword);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(decryptedPassword, salt);

      const userEntity = plainToInstance(User, createUserDto);
      const userCreated = { id: 1, ...userEntity, password: hashedPassword };

      jest.spyOn(userRepository, 'save').mockResolvedValue(userCreated);

      const result = await userService.create(createUserDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: userEntity.email,
          name: userEntity.name,
        }),
      );
      expect(cryptoService.decrypt).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User)); // Verify that the save method was called with a User entity
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'testuser@example.com',
        password: 'ecdbbb31b42c8ce3c6afcbc85abe37ba',
      };

      const decryptedPassword = 'test1234';

      mockCryptoService.decrypt.mockReturnValue(decryptedPassword);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(decryptedPassword, salt);

      const userEntity = plainToInstance(User, {
        id: 1,
        email: loginUserDto.email,
        password: hashedPassword,
        name: test,
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);

      mockJWTService.signAsync.mockReturnValue('token');

      const result = await userService.login(loginUserDto);

      expect(result).toEqual(
        expect.objectContaining({ access_token: 'token' }),
      );
      expect(cryptoService.decrypt).toHaveBeenCalledWith(loginUserDto.password);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginUserDto.email },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: userEntity.id,
        email: userEntity.email,
        name: userEntity.name,
      });
    });
    it('should throw an exception for an invalid email', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'encryptedpassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.login(loginUserDto)).rejects.toThrowError(
        'Invalid Email',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginUserDto.email },
      });
    });

    it('should throw an exception for an invalid password', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'testuser@example.com',
        password: 'ecdbbb31b42c8ce3c6afcbc85abe37ba',
      };

      const decryptedPasswordIncorrect = 'test123456';
      const decryptedPasswordCorrect = 'test1234';
      mockCryptoService.decrypt.mockReturnValue(decryptedPasswordIncorrect);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(decryptedPasswordCorrect, salt);

      const userEntity = plainToInstance(User, {
        email: loginUserDto.email,
        password: hashedPassword,
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);

      await expect(userService.login(loginUserDto)).rejects.toThrowError(
        'Invalid Passsword',
      );
      expect(cryptoService.decrypt).toHaveBeenCalledWith(loginUserDto.password);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginUserDto.email },
      });
    });
  });
});
