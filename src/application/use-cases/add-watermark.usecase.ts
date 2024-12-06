import { PageSizes, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default class AddWatermarkAndSignatureUseCase {
  async execute(
    base64Pdf: string,
    base64img: string,
    signatureText: string
  ): Promise<{ pdf: string }> {
    const pdfDoc = await this.loadPdf(base64Pdf);
    const newPage = this.addNewPage(pdfDoc);
    const signatureFont = await this.getSignatureFont(pdfDoc);
    const signatureFontForName = await this.getSignatureFontForName(pdfDoc);
    const introFont = await this.getIntroFont(pdfDoc);

    const yCoordText = newPage.getHeight() - 150;
    const signatureWidth = this.getTextWidth(signatureText, signatureFont);

    this.drawIntroductionText(newPage, introFont);
    this.drawSignature(newPage, signatureText, signatureWidth, yCoordText, signatureFontForName);
    this.drawLineOfDashes(newPage, signatureWidth, signatureFont, yCoordText);
    this.drawSingClient(newPage, signatureText, yCoordText, signatureFont);

    await this.addWatermarkImage(pdfDoc, newPage, base64img, yCoordText);

    return this.savePdf(pdfDoc);
  }

  private async loadPdf(base64Pdf: string): Promise<PDFDocument> {
    const pdfBytes = Buffer.from(base64Pdf, 'base64');
    return await PDFDocument.load(pdfBytes);
  }

  private addNewPage(pdfDoc: PDFDocument): any {
    return pdfDoc.addPage(PageSizes.Letter);
  }

  private async getSignatureFont(pdfDoc: PDFDocument): Promise<any> {
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  private async getSignatureFontForName(pdfDoc: PDFDocument): Promise<any> {
    return await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  }

  private async getIntroFont(pdfDoc: PDFDocument): Promise<any> {
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  private getTextWidth(text: string, font: any): number {
    const fontSize = 16;
    return font.widthOfTextAtSize(text, fontSize);
  }

  private drawIntroductionText(newPage: any, introFont: any): void {
    const introText = "Este documento fue construido por medio de la plataforma DEBTLatam.";
    const introTextWidth = introFont.widthOfTextAtSize(introText, 12);
    const centerX = (newPage.getWidth() - introTextWidth) / 2;

    newPage.drawText(introText, {
      x: centerX,
      y: newPage.getHeight() - 40,
      size: 12,
      font: introFont,
      color: rgb(0, 0, 0),
    });
  }

  private drawSignature(newPage: any, signatureText: string, signatureWidth: number, yCoordText: number, signatureFontForName: any): void {
    const centerX = (newPage.getWidth() - signatureWidth) / 2;
    newPage.drawText(signatureText, {
      x: centerX - 15,
      y: yCoordText,
      size: 18,
      font: signatureFontForName,
      color: rgb(0, 0, 0),
    });
  }

  private drawLineOfDashes(newPage: any, signatureWidth: number, signatureFont: any, yCoordText: number): void {
    const lineOfDashes = '_'.repeat(Math.floor(signatureWidth / 18)) + '________________';
    const lineOfDashesWidth = signatureFont.widthOfTextAtSize(lineOfDashes, 13);
    const centerXFooter = (newPage.getWidth() - lineOfDashesWidth) / 2;

    newPage.drawText(lineOfDashes, {
      x: centerXFooter - 10,
      y: yCoordText - 8,
      size: 13,
      font: signatureFont,
      color: rgb(0, 0, 0),
    });
  }

  private drawSingClient(newPage: any, signatureText: string, yCoordText: number, signatureFont: any): void {
    const centerX = (newPage.getWidth() - signatureFont.widthOfTextAtSize(signatureText, 13)) / 2;
    newPage.drawText("Firma Cliente", {
      x: centerX,
      y: yCoordText - 25,
      size: 13,
      font: signatureFont,
      color: rgb(0, 0, 0),
    });
  }

  private async addWatermarkImage(pdfDoc: PDFDocument, newPage: any, base64img: string, yCoordText: number): Promise<void> {
    const imageBytes = Buffer.from(base64img, 'base64');
    const watermarkImage = base64img.startsWith("iVBORw0KGgo")
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    const { width: imgWidth, height: imgHeight } = watermarkImage.scale(0.5);

    newPage.drawImage(watermarkImage, {
      x: (newPage.getWidth() - imgWidth) / 2,
      y: yCoordText - 205,
      width: imgWidth - 15,
      height: imgHeight - 15,
    });
  }

  private async savePdf(pdfDoc: PDFDocument): Promise<{ pdf: string }> {
    const modifiedPdfBytes = await pdfDoc.save();
    return {
      pdf: Buffer.from(modifiedPdfBytes).toString('base64'),
    };
  }
}
