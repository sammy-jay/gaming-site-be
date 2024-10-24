import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlayerDto } from './dtos/create-player.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayersService {
  constructor(private prismaService: PrismaService) {}

  async getAnalytics(playerId: string) {
    const allInfo =  await this.prismaService.player.findUnique({
      where: { id: playerId },
    })

    return {
      allInfo
    }
  }
  async getByEmail(email: string) {
    const player = await this.prismaService.player.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
      },
    });
    if (player) return player;

    throw new NotFoundException('Invalid credentials');
  }

  async getById(id: string) {
    const player = await this.prismaService.player.findUnique({
      where: { id },
    });

    if (player) {
      delete player.password;
      return player;
    }

    throw new NotFoundException('Invalid credentials');
  }

  async createplayer(playerData: CreatePlayerDto) {
    const newplayer = await this.prismaService.player.create({
      data: playerData,
    });
    console.log(newplayer);
    return newplayer;
  }

  async setCurrentRefreshToken(refreshToken: string, id: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await this.prismaService.player.update({
      where: { id },
      data: {
        currentHashedRefreshToken: hashedToken,
      },
    });
  }
}
