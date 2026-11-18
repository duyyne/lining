import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationModule, Duration } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        // entities: [],
        autoLoadEntities: true,
        synchronize: true, //TODO: production phải đổi thành false
      }),
    }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        accessToken: {
          key: config.get<string>('JWT_SECRET')!,
          issuer: 'lining-api',
          audience: 'lining-app',
          ttl: (config.get<string>('JWT_EXPIRES_IN') ?? '15m') as Duration,
        },
        refreshToken: false,
      }),
    }),
    AuthorizationModule.forRoot(),

    ProductsModule,

    CategoriesModule,

    UsersModule,

    AuthModule,

    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
