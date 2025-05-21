// src/search/search.controller.ts
import {
    Body,
    Controller,
    Post,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Role, User as PrismaUser } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SearchService } from './search.service';
import {
    SearchProfilesRequestDto,
    SearchProfilesResponseDto,
} from './dto/search-profiles.dto';

@ApiTags('Search Agent')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post('find-profiles')
    @UseGuards(AuthGuard)
    @Roles(Role.USER, Role.ADMIN) // Adjust roles as needed
    @ApiOperation({ summary: 'Find profiles based on ICP' })
    @ApiBody({
        type: SearchProfilesRequestDto,
        description: "Optional ICP data to override user's default ICP.",
    })
    @ApiResponse({
        status: 200,
        description: 'Profiles found successfully.',
        type: SearchProfilesResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'ICP not found for user.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async findProfiles(
        @CurrentUser() user: PrismaUser, // PrismaUser is the type from your global express.d.ts
        @Body(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        )
        searchProfilesDto: SearchProfilesRequestDto,
    ): Promise<SearchProfilesResponseDto> {
        return this.searchService.findProfiles(user.id, searchProfilesDto.icpData);
    }
}
