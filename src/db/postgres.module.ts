import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {

        if (configService.get<string>("NODE_ENV") === "production") {

          return {
            type: "postgres",
            url: configService.get<string>("PG_URL"),
            autoLoadEntities: false,
            synchronize: false,
            poolSize: 5,
            extra: {
              connectionLimit: 5,
              connectionTimeoutMillis: 1000
            }
          };
        }


        return {
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "myuser",
          password: "123",
          database: "It_blog",
          autoLoadEntities: false,
          synchronize: false,
          poolSize: 5,
          extra: {
            connectionLimit: 5,
            connectionTimeoutMillis: 1000
          }
        };

      },
      inject: [ConfigService]
    })
  ]
})
export class DatabasePostgresModule {
}