import { Controller, Post, Body, Get, Param, Patch, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, SearchPermissionDto, UpdatePermissionDto } from './permissions.dto';
import { HttpResp } from '@libs/common/utils/http';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('create')
  async create(@Body() dto: CreatePermissionDto) {
    const data = await this.permissionsService.create(dto);
    return HttpResp.success(data);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.permissionsService.findOne(id);
    return HttpResp.success();
  }

  @Patch(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePermissionDto) {
    await this.permissionsService.update(id, dto);
    return HttpResp.success();
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.permissionsService.remove(id);
    return HttpResp.success();
  }

  @Post('search')
  async search(@Body() dto: SearchPermissionDto) {
    const { data, meta } = await this.permissionsService.search(dto);
    return HttpResp.success(data, meta);
  }
}
