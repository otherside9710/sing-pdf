import { Controller, Post, Body } from '@nestjs/common';
import AddWatermarkAndSignatureUseCase from '../../application/use-cases/add-watermark.usecase';

@Controller('pdf')
export class PdfController {
  private readonly addWatermarkUseCase = new AddWatermarkAndSignatureUseCase();

  @Post('watermark')
  async addWatermark(@Body() body: { base64Pdf: string; base64img: string, user_name: string }) {
    try {
      const { base64Pdf, user_name, base64img } = body;
      return await this.addWatermarkUseCase.execute(base64Pdf, base64img, user_name);
    } catch (error) {
      console.log(error);
    }
  }
}

