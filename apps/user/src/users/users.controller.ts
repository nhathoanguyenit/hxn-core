import { Controller, Get, Post, Body, Param, Delete, Patch, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from './users.dto';
import { Monitoring } from '@libs/common/utils/monitor';
import { HttpResp } from '@libs/common/utils/http';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return HttpResp.success(data);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.usersService.findOne({ id });
    return HttpResp.success(data);
  }

  @Patch(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateUserDto) {
    await this.usersService.update(id, dto);
    return HttpResp.success();
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.remove(id);
    return HttpResp.success();
  }

  @Post(':id/assign-roles')
  async assignRoles(@Param('id', new ParseUUIDPipe()) id: string, @Body('roles') roles: string[]) {
    if (!roles || !Array.isArray(roles)) {
      throw new BadRequestException('roles must be an array of IDs or codes');
    }
    await this.usersService.assignRoles(id, roles);
    return HttpResp.success();
  }

  @Post('search')
  @Monitoring()
  async search(@Body() dto: SearchUserDto) {
    const { data, meta } = await this.usersService.search(dto);
    return HttpResp.success(data, meta);
  }
}
