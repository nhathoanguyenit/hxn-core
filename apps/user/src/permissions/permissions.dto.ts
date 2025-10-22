import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

export class PermissionResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SearchPermissionDto {
  @IsOptional()
  @IsString()
  search?: string;

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
