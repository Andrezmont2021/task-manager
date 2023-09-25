import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @Length(1, 100, {
    message: 'Email must be between 1 and 100 characters',
  })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(1, 255, {
    message: 'Password must be between 1 and 255 characters',
  })
  // The password travels encrypted
  password: string;
}
