import { Player } from '@prisma/client';
import { Request } from 'express';

export interface RequestUser extends Request {
  user: Player;
}
