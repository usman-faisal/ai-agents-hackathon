import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../common/types/type';
import { IcpService } from './icp.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GenerateIcpDto } from './dto/generate-icp.dto';

@Controller('icp')
export class IcpController {
    constructor(private readonly icpService: IcpService) { }

    @Post('chat')
    @Roles(...Object.values(Role))
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                prompt: {
                    type: 'string',
                },
            },
        },
    })

    @Get('chats')
    @Roles(...Object.values(Role))
    @UseGuards(AuthGuard)
    async chatIcp(
        @CurrentUser() user: User,
        @Body() generateIcpDto: GenerateIcpDto, 
        @UploadedFiles() files: MulterFile[],
    ) {
        return this.icpService.chatIcp(user.id, generateIcpDto.prompt, files);
    }


    @Get('chats')
    @Roles(...Object.values(Role))
    @UseGuards(AuthGuard)
    async getChats(
        @CurrentUser() user: User,
    ) {
        return this.icpService.getChats(user.id);
    }


    @Get('')
    @Roles(...Object.values(Role))
    @UseGuards(AuthGuard)
    async getIcp(
        @CurrentUser() user: User,
    ) {
        return this.icpService.getIcp(user.id);
    }

}
