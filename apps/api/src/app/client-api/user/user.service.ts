import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@/db/entities/auths/user.entity';
import { AddressEntity } from '@/db/entities/auths/address.entity';
import { OrderEntity } from '@/db/entities/orders/order.entity';
import { PaginationDTO } from '@/common/dtos/pagination';
import type { AuthenticatedUser } from '@/shared/auth/auth.types';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { SaveAddressDto } from './dto/save-address.dto';

@Injectable()
export class ClientUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  // ─── Profile ──────────────────────────────────────────────────────────────────

  async getProfile(currentUser: AuthenticatedUser) {
    const user = await this.userRepo.findOneBy({ id: currentUser.id });
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async updateProfile(currentUser: AuthenticatedUser, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOneBy({ id: currentUser.id });
    if (!user) throw new NotFoundException('User not found');

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone ?? null;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl ?? null;

    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      fullName: saved.fullName,
      email: saved.email,
      phone: saved.phone,
      avatarUrl: saved.avatarUrl,
      role: saved.role,
      emailVerified: saved.emailVerified,
    };
  }

  // ─── Addresses ────────────────────────────────────────────────────────────────

  listAddresses(currentUser: AuthenticatedUser) {
    return this.addressRepo.find({
      where: { user: { id: currentUser.id } },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async addAddress(currentUser: AuthenticatedUser, dto: SaveAddressDto) {
    if (dto.isDefault) {
      await this.clearDefaultAddresses(currentUser.id);
    }

    const address = this.addressRepo.create({
      user: { id: currentUser.id } as any,
      recipientName: dto.recipientName,
      street: dto.street,
      city: dto.city,
      country: dto.country,
      postalCode: dto.postalCode ?? null,
      isDefault: dto.isDefault ?? false,
    });

    return this.addressRepo.save(address);
  }

  async updateAddress(addressId: string, currentUser: AuthenticatedUser, dto: SaveAddressDto) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
      relations: ['user'],
    });

    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== currentUser.id) throw new ForbiddenException('Access denied');

    if (dto.isDefault) {
      await this.clearDefaultAddresses(currentUser.id);
    }

    address.recipientName = dto.recipientName;
    address.street = dto.street;
    address.city = dto.city;
    address.country = dto.country;
    address.postalCode = dto.postalCode ?? null;
    address.isDefault = dto.isDefault ?? false;

    return this.addressRepo.save(address);
  }

  async removeAddress(addressId: string, currentUser: AuthenticatedUser) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
      relations: ['user'],
    });

    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== currentUser.id) throw new ForbiddenException('Access denied');

    await this.addressRepo.remove(address);
    return { message: 'Address deleted' };
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  async listMyOrders(currentUser: AuthenticatedUser, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.orderRepo.findAndCount({
      where: { user: { id: currentUser.id } },
      relations: ['items', 'items.variant', 'shippingMethod'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, pagination };
  }

  private async clearDefaultAddresses(userId: string) {
    await this.addressRepo
      .createQueryBuilder()
      .update()
      .set({ isDefault: false })
      .where('user_id = :userId', { userId })
      .execute();
  }
}
