import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets, FindOptionsWhere } from 'typeorm';
import { User } from '../../../../libs/common/src/entities/user.entity';
import { Role } from '../../../../libs/common/src/entities/role.entity';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from './users.dto';
import { PasswordUtils } from '@libs/common/utils/password';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>
  ) {}

  async search(dto: SearchUserDto) {
    const { key, page, limit, roles, id } = dto;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .orderBy('user.created_at', 'DESC');

    if (id) {
      qb.andWhere('user.id = :id', { id });
    }

    if (key) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.username ILIKE :search OR user.fullname ILIKE :key', {
            key: `%${key}%`,
          });
        })
      );
    }

    if (roles && roles.length > 0) {
      qb.andWhere('role.code IN (:...roles)', { roles });
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

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['roles'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne({ id, username }: { id?: string; username?: string }): Promise<User> {
    if (!id && !username) {
      throw new NotFoundException('Must provide either id or username');
    }

    const where: FindOptionsWhere<User>[] = [];

    if (id) where.push({ id });
    if (username) where.push({ username });

    const user = await this.userRepo.findOne({
      where,
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User not found with ${id ? `id: ${id}` : `username: ${username}`}`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) throw new BadRequestException('Username already exists');

    const hash = await PasswordUtils.encode(dto.password);
    const user = this.userRepo.create({
      username: dto.username,
      fullname: dto.fullname,
      password: hash,
    });

    if (dto.roles && dto.roles.length > 0) {
      const roles = await this.findRolesByCodesOrIds(dto.roles);
      user.roles = roles;
    }

    return await this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne({ id });

    if (dto.password) {
      dto.password = await PasswordUtils.encode(dto.password);
    }

    Object.assign(user, dto);

    if (dto.roles) {
      const roles = await this.findRolesByCodesOrIds(dto.roles);
      user.roles = roles;
    }

    return await this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne({ id });
    await this.userRepo.remove(user);
  }

  async assignRoles(userId: string, roles: string[]): Promise<User> {
    const user = await this.findOne({ id: userId });
    const foundRoles = await this.findRolesByCodesOrIds(roles);

    user.roles = foundRoles;
    return await this.userRepo.save(user);
  }

  private async findRolesByCodesOrIds(values: string[]): Promise<Role[]> {
    const roles = await this.roleRepo.find({
      where: [{ id: In(values) }, { code: In(values) }],
    });

    if (roles.length === 0) throw new NotFoundException('No valid roles found for given IDs/codes');

    return roles;
  }
}
