import { ConfigModule } from "@nestjs/config";
import { configuration } from "./configuration";
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [".env.local", ".env"],
  load: [configuration],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    MONGO_URI: Joi.string().required(),
    PORT: Joi.number().default(3000),
    EMAIL: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    SECRET: Joi.string().required(),
  }),
});
