import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PlayersModule } from "./players/players.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import * as Joi from "@hapi/joi";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        // CLOUDINARY_NAME: Joi.string().required(),
        // CLOUDINARY_API_KEY: Joi.string().required(),
        // CLOUDINARY_API_SECRET: Joi.string().required(),
        // EMAIL_HOST: Joi.string().required(),
        // EMAIL_PORT: Joi.number().required(),
        // EMAIL_ADDRESS: Joi.string().required(),
        // EMAIL_PASSWORD: Joi.string().required(),
      }),
    }),
    PrismaModule,
    AuthModule,
    PlayersModule,
    CloudinaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
