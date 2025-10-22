import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../../user/src/users/users.module';
import { RolesModule } from '../../user/src/roles/roles.module';
import { PermissionsModule } from '../../user/src/permissions/permissions.module';
import { User } from '../../../libs/common/src/entities/user.entity';
import { Role } from '../../../libs/common/src/entities/role.entity';
import { Permission } from '../../../libs/common/src/entities/permission.entity';
import { MonitorModule } from '@libs/common/utils/monitor';
import { AuthModule } from '../../user/src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AppSocketGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/user/.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
        type: 'postgres',
        host: process.env.PG_HOST,
        port: parseInt(process.env.PG_PORT as any, 10),
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
        entities: [User, Role, Permission],
        synchronize: false,
        logging: false,
      }},
    }),
    JwtModule.register({
      global:true,
      secret: process.env.JWT_SECRET || 'app_jwt_secret',
      signOptions: { expiresIn: '365d' },
    }),
    UsersModule,
    RolesModule,
    PermissionsModule,
    MonitorModule.register(),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppSocketGateway],
})
export class AppModule {}
