import { Injectable } from "@nestjs/common";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common/exceptions";
import { JwtService } from "@nestjs/jwt";
import { PlayersService } from "src/players/players.service";
import { RegistrationDto } from "./dtos/registration-data.dto";
import * as bcrypt from "bcrypt";
import { PostgresErrorCode } from "./constants";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./interfaces/token-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private playersService: PlayersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(regData: RegistrationDto) {
    try {
      const hashedPassword = await bcrypt.hash(regData.password, 10);
      const createdUser = await this.playersService.createplayer({
        ...regData,
        password: hashedPassword,
      });

      delete createdUser.password;
      console.log(createdUser);
      return createdUser;
    } catch (error) {
      console.log(error)
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException("User with email already exists");
      }
      throw new InternalServerErrorException(
        "Something went wrong",
        error?.code
      );
    }
  }

  async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.playersService.getByEmail(email);

      await this.verifyPassword(plainTextPassword, user.password);

      delete user.password;
      return user;
    } catch (error) {
      throw new BadRequestException("Invalid credentials");
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword
    );
    if (!isPasswordMatching)
      throw new BadRequestException("Invalid credentials");
  }

  async getCookieWithJwtToken(userId: string) {
    const payload: TokenPayload = { userId };
    const access_token = await this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_ACCESS_TOKEN_SECRET"),
      expiresIn: `${this.configService.get(
        "JWT_ACCESS_TOKEN_EXPIRATION_TIME"
      )}s`,
    });

    return access_token;
    // return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
    //   'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    // )}`;
  }
  async getCookieWithJwtRefreshToken(userId: string) {
    const payload: TokenPayload = { userId };
    const refresh_token = await this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: `${this.configService.get(
        "JWT_REFRESH_TOKEN_EXPIRATION_TIME"
      )}s`,
    });

    return refresh_token;
    // return `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
    //   'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    // )}`;
  }

  getCookieForLogout() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=$0`;
  }
}
