import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../../../libs/common/src/entities/role.entity';
import { Permission } from '../../../../libs/common/src/entities/permission.entity';
import { User } from '../../../../libs/common/src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}