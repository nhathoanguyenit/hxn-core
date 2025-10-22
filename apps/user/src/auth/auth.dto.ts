import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginDto {

  @ApiPropertyOptional({
    example: 'admin',
    description: 'Username (optional if email is provided)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required when email is not provided' })
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'User password (min 6 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
