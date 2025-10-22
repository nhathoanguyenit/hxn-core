import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Role } from '../../../../libs/common/src/entities/role.entity';
import { Permission } from '../../../../libs/common/src/entities/permission.entity';
import { CreateRoleDto, SearchRoleDto, UpdateRoleDto } from './roles.dto';
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepo.findOne({
      where: [{ code: dto.code }, { name: dto.name }],
    });
    if (exists) throw new BadRequestException('Role code or name already exists');

    const role = this.roleRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });

    if (dto.permissionIds?.length) {
      role.permissions = await this.permissionRepo.findByIds(dto.permissionIds);
    }

    return this.roleRepo.save(role);
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.permissionIds) {
      const permissions = await this.permissionRepo.findByIds(dto.permissionIds);
      role.permissions = permissions;
    }

    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepo.remove(role);
  }

  async search(dto: SearchRoleDto) {
    const { key, page, limit } = dto;

    const qb = this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .orderBy('role.created_at', 'DESC');

    if (key) {
      qb.where(
        new Brackets((qb) => {
          qb.where('role.code ILIKE :search').orWhere('role.name ILIKE :key');
        })
      ).setParameter('key', `%${key}%`);
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
