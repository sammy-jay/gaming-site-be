import { Controller } from "@nestjs/common";
import {
  Body,
  HttpCode,
  Post,
  UseGuards,
  Req,
  Res,
} from "@nestjs/common/decorators";
import { HttpStatus } from "@nestjs/common/enums";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegistrationDto } from "./dtos/registration-data.dto";
import { LocalAuthGuard } from "./guards/local.guard";
import { RequestUser } from "./interfaces/request-user.interface";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { PlayersService } from "src/players/players.service";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dtos/login.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private playersService: PlayersService
  ) {}

  @Post("register")
  async register(
    @Body() registrationDto: RegistrationDto,
    @Res() res: Response
  ) {
    console.log(registrationDto);
    
    const user = await this.authService.register(registrationDto);
    delete user.password;
    delete user.currentHashedRefreshToken;

    const access_token = await this.authService.getCookieWithJwtToken(user.id);
    const refresh_token = await this.authService.getCookieWithJwtRefreshToken(
      user.id
    );

    await this.playersService.setCurrentRefreshToken(refresh_token, user.id);

    return res.send({
      access_token,
      refresh_token,
      user: { ...user },
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post("login")
  async login(@Req() req: RequestUser, @Res() res: Response) {
    const { user } = req;
    delete user.password;
    delete user.currentHashedRefreshToken;

    const access_token = await this.authService.getCookieWithJwtToken(user.id);
    const refresh_token = await this.authService.getCookieWithJwtRefreshToken(
      user.id
    );

    await this.playersService.setCurrentRefreshToken(refresh_token, user.id);

    return res.send({
      access_token,
      refresh_token,
      user: { ...user },
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Req() req: RequestUser, @Res() res: Response) {
    return res.setHeader("Set-Cookie", this.authService.getCookieForLogout());
  }
}
