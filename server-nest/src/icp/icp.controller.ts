import {
  Body,
  Controller,
  Post,
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

@Controller('icp')
export class IcpController {
  constructor(private readonly icpService: IcpService) {}

  @Post('generate')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(Role))
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
  async generate(
    @CurrentUser() user: User,
    @Body('prompt') prompt: string,
    @UploadedFiles() files: MulterFile[],
  ) {
    return this.icpService.generateIcp(user, prompt, files);
  }
}
