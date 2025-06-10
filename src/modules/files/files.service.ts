import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  public getStaticEventImage(imageName: string) {
    const path = join(__dirname, '../../static/event', imageName);

    if (!existsSync(path))
      throw new BadRequestException(`No Event found with image ${imageName}`);

    return path;
  }
}
