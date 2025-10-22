import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../../../libs/common/src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../../../libs/common/src/entities/role.entity';
import { Permission } from '../../../../libs/common/src/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
