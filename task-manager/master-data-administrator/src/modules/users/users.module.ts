import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { User } from './entities/user.entity';
import { CryptoService } from 'src/utils/crypto.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, CryptoService],
})
export class UsersModule {}
