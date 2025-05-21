// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { IcpModule } from './icp/icp.module';
import { SearchModule } from './search/search.module'; // Import the new SearchModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    IcpModule,
    SearchModule, // Add SearchModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
