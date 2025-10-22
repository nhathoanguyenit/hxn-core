import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@libs/common/strategy/jwt.strategy';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../../../libs/common/src/entities/permission.entity';
import { Role } from '../../../../libs/common/src/entities/role.entity';
import { User } from '../../../../libs/common/src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  providers: [JwtStrategy, AuthService],
  controllers: [AuthController],

})
export class AuthModule {}
