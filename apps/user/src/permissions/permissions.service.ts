import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CreatePermissionDto, SearchPermissionDto, UpdatePermissionDto } from './permissions.dto';
import { Permission } from '../../../../libs/common/src/entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>
  ) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({
      where: [{ code: dto.code }, { name: dto.name }],
    });
    if (exists) throw new BadRequestException('Permission code or name already exists');

    const permission = this.permissionRepo.create(dto);
    return this.permissionRepo.save(permission);
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException(`Permission with id ${id} not found`);
    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, dto);
    return this.permissionRepo.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepo.remove(permission);
  }

  async search(dto: SearchPermissionDto) {
    const { search, page, limit } = dto;

    const qb = this.permissionRepo.createQueryBuilder('permission').orderBy('permission.created_at', 'DESC');

    if (search) {
      qb.where(
        new Brackets((qb) => {
          qb.where('permission.code ILIKE :search')
            .orWhere('permission.name ILIKE :search')
            .orWhere('permission.description ILIKE :search');
        })
      ).setParameter('search', `%${search}%`);
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }
}
