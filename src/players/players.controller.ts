import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PlayersService } from './players.service';
import { RequestUser } from 'src/auth/interfaces/request-user.interface';

@ApiTags('Players')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayersController {
  constructor(private playersService: PlayersService) {}
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('analytics')
  getAnalytics(@Req() req: RequestUser) {
    return this.playersService.getAnalytics(req.user.id);
  }
}
