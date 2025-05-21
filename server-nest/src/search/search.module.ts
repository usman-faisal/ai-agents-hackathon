// src/search/search.module.ts
import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/common/services/prisma.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule

@Module({
    imports: [
        HttpModule, // For making HTTP requests
        ConfigModule, // To use ConfigService for environment variables
    ],
    controllers: [SearchController],
    providers: [SearchService, PrismaService], // Provide PrismaService here
})
export class SearchModule { }
