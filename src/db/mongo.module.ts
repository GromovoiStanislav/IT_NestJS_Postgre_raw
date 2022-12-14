import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from "@nestjs/config";
import { Module } from '@nestjs/common';


@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        // if (configService.get<string>('NODE_ENV') === 'test') {
        //   return {
        //     uri: await startMongoMemoryServer(),
        //   };
        // }

        return {
          uri: configService.get<string>('MONGO_URI'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseMongoModule {}