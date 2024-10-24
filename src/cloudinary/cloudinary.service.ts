import { BadRequestException, Injectable } from '@nestjs/common';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'contestants', // Optional: specify a folder in Cloudinary
        },
      );
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new BadRequestException('Failed to upload file to Cloudinary');
    }
  }
}
