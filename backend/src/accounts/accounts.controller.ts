import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.accountsService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }
}
