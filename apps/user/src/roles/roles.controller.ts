import { Controller, Post, Body, Get, Param, Patch, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, SearchRoleDto, UpdateRoleDto } from './roles.dto';
import { HttpResp } from '@libs/common/utils/http';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  async create(@Body() dto: CreateRoleDto) {
    const data = await this.rolesService.create(dto);
    return HttpResp.success(data);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.rolesService.findOne(id);
    return HttpResp.success();
  }

  @Patch(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateRoleDto) {
    await this.rolesService.update(id, dto);
    return HttpResp.success();
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.rolesService.remove(id);
    return HttpResp.success();
  }

  @Post('search')
  async search(@Body() dto: SearchRoleDto) {
    const { data, meta } = await this.rolesService.search(dto);
    return HttpResp.success(data, meta);
  }
}
