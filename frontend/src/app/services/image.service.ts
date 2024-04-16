import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { ToastService } from './toast.service';
import * as _ from 'lodash';

export class Result {
    constructor(public path: string, public file: File) {}
}

  
@Injectable()
export class ImageService {
    private serviceUrl = AppConfig.backendUrl + 'sequence';
    public imageError;

    constructor(
        private httpClient: HttpClient,
        private toastService: ToastService
    ) { }


    public uploadImage(file: File): Observable<Response> {
        const formData = new FormData();

        formData.append("file", file, file.name);

        return this.httpClient.post(this.serviceUrl + '/image', formData).pipe(
            map((res: any) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    public checkFormat(file){
        const max_size = 20971520;
        const allowed_types = ['image/png', 'image/jpeg', 'image/bmp'];

        if (file.size > max_size) {
            this.imageError =
                'El tamaño máximo permitido por archivo es de ' + max_size / 1000 + 'Mb';
                this.toastService.show(this.imageError, { classname: 'bg-danger text-white' });
            return false;
        }

        if (!_.includes(allowed_types, file.type)) {
            this.imageError = 'Solo se permiten imagenes en formato JPG, PNG o BMP';
            this.toastService.show(this.imageError, { classname: 'bg-danger text-white' });
            return false;
        }
        return true;
    }

    public checkSize(rs){
        const max_height = 56;
        const max_width = 56;

        const img_height = rs.currentTarget['height'];
        const img_width = rs.currentTarget['width'];

        if (img_height != max_height || img_width != max_width) {
            this.imageError =
                'Dimensiones permitidas: ' +
                max_height +
                '*' +
                max_width +
                'px';
                this.toastService.show(this.imageError, { classname: 'bg-danger text-white' });
            return false;
        }
        else{
            return true;
        }
    }

    public readImage(file): Promise<Result>{
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new DOMException("Problem parsing input file."));
            };
            reader.onload = (e: any) => {
                const image = new Image();
                image.src = e.target.result;
                const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
                const ctx = canvas?.getContext("2d");
                image.onload = rs => {
                    if (this.checkSize(rs)) {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        ctx.drawImage(image, 0, 0);
                        
                        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        this.rgbaToNGrayscales(imageData.data, 2);
                        ctx.putImageData(imageData, 0, 0);
                        var filename = file.name.substr(0, file.name.lastIndexOf("."));

                        canvas.toBlob(async(blob) => {
                            var newFile = new File([blob], filename +'.bmp', { type: "image/bmp" });
                            
                            var result = new Result(canvas.toDataURL(), newFile);
                            resolve(result);
                        }, 'image/bmp');
                    }
                };
            };

            reader.readAsDataURL(file);
        });
    }
    
    rgbaToNGrayscales(src, numScales) {
        var d = (numScales - 1) / 255, inv_d = 1 / d, round = Math.round;
        for (var i = 0; i < src.length; i += 4) {
            src[i] = src[i + 1] = src[i + 2] = round(((src[i] * 4899 + src[i + 1] * 9617 + src[i + 2] * 1868 + 8192) >> 14) * d) * inv_d;
        }
    }
}