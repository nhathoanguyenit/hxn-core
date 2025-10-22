import { IsNotEmpty, IsString, IsOptional, IsArray, Min, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsArray()
  roles?: string[]; // optional filter by role codes or ids

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsOptional()
  roles?: string[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto {
  id: string;
  username: string;
  fullname: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}