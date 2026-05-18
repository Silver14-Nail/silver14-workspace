import { Controller, Get, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { AdminUsersService } from './users.service';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of users' })
  list(@Query() query: UserListQueryDto) {
    return this.usersService.listUsers(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'User detail with addresses' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getOne(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'User soft-deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.removeUser(id);
  }
}
