import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@shortfactory.ai',
    description: 'Email address of the registered system operator or administrator',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty({
    example: 'Admin@123456',
    description: 'Account password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'Password must contain at least 6 characters' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
