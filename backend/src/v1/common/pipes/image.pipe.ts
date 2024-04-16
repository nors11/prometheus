import { Injectable, PipeTransform } from '@nestjs/common';
import * as Jimp from 'jimp';
import * as fs from 'fs';

@Injectable()
export class ImagePipe implements PipeTransform<any> {
    async transform(file: any): Promise<any> {
        try {
            await this.convertirA1Bit(file)
            return file;
        } catch (error) {
            console.error('Error al convertir la imagen:', error);
            throw new Error('Error al convertir la imagen');
        }
    }
    async convertirA1Bit(file): Promise<void> {
        try {
            const imagen = await Jimp.read(file.path);

            imagen.greyscale();
            const binaryImageData = [];
            // // Iterar sobre cada píxel y convertir a blanco o negro (1 bit)
            imagen.scan(0, 0, imagen.bitmap.width, imagen.bitmap.height, function (x, y, idx) {
                const color = this.getPixelColor(x, y);
                const nuevoColor = color > 255 ? 0xFFFFFFFF : 0x00000000;
                const bitValue = color > 255 ? 0 : 1;

                binaryImageData.push(bitValue);
                this.bitmap.data.writeUInt32BE(nuevoColor, idx);
            });
            await imagen.writeAsync(file.path);
            const buffer = fs.readFileSync(file.path);
            fs.writeFileSync(file.path, buffer);
        } catch (error) {
            console.error('Error al convertir la imagen:', error);
            throw new Error('Error al convertir la imagen');
        }
    }
}
