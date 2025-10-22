import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from '../../../../libs/common/src/entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../../../libs/common/src/entities/role.entity';
import { User } from '../../../../libs/common/src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [TypeOrmModule, PermissionsService], 
})
export class PermissionsModule {}