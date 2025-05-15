import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../common/types/type';
import { IcpService } from './icp.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('icp')
export class IcpController {
  constructor(private readonly icpService: IcpService) {}

  @Post('generate')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(...Object.values(Role))
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
    console.log('Received prompt:', prompt);
    console.log('Received files on backend:', files); // Check if files arrive
    // console.log('Received audio on backend:', audio);

    return this.icpService.generateIcp(user, prompt, files);
  }
}
