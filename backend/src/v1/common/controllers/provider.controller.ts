import { Controller, Get, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ProductType, FringeType } from '../schemas/product-model.schema';

@Controller('v1/provider')
export class ProviderController {
    

    constructor(
    ) {

    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/drawing')
    async indexSequencesActionParametersDrawings(@Res() res): Promise<[]>{
        const drawingData = [   'Fondo Negro', 'Latina Llena', 'Latina Vacía', 'Malta Llena', 'Malta Vacía', 'Copa y serp.', '24 Horas', '12 Horas', 'Sol', 'Luna', 'Información', 
                                'Símb. Hombre', 'Símb. Mujer', 'Hombre', 'Mujer', 'Probeta', 'Flecha abajo', 'Flecha arriba', 'Flecha izqui.', 'Flecha dere.', 'Gafas', 
                                'Árbol navidad', 'Regalo navid.', 'Estrella navid.','Campana navid.', 'Termómetro', 'Teléfono'
        ];

        const drawing = [];
        for(const [propertyKey, propertyValue] of Object.entries(drawingData)) {
            drawing.push({ id: (parseInt(propertyKey) + 1).toString(), name: propertyValue });
        } 
        
        return res.status(HttpStatus.OK).json(drawing)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/effect')
    async indexSequencesActionParametersEffects(@Res() res): Promise<[]>{
        const effectData = [   'Desplazar Hacia Arriba', 'Desplazar Hacia Abajo', 'Desplazar Hacia la Izquierda', 'Desplazar Hacia la Derecha',
                                'Fijo (Sin Movimiento)', 'Fijo Parpadeando (Sin Movimiento)'
        ];

        const effect = [];
        for(const [propertyKey, propertyValue] of Object.entries(effectData)) {
            effect.push({ id: (parseInt(propertyKey) + 1).toString(), name: propertyValue });
        } 
        
        return res.status(HttpStatus.OK).json(effect)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/font')
    async indexSequencesActionParametersFontSizes(@Res() res): Promise<[]>{
        const fontData = [ 'Pequeña 1', 'Pequeña 2', 'Normal 1', 'Normal 2' ];

        const fontSize = [];
        for(const [propertyKey, propertyValue] of Object.entries(fontData)) {
            fontSize.push({ id: (parseInt(propertyKey) + 1).toString(), name: propertyValue });
        } 
        
        return res.status(HttpStatus.OK).json(fontSize)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/row')
    async indexSequencesActionParametersRows(@Res() res): Promise<[]>{
        const rowData = [ 'Fila 1', 'Fila 2', 'Fila 3' ];

        const row = [];
        for(const [propertyKey, propertyValue] of Object.entries(rowData)) {
            row.push({ id: (parseInt(propertyKey) + 1).toString(), name: propertyValue });
        } 
        
        return res.status(HttpStatus.OK).json(row)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/speed')
    async indexSequencesActionParametersSpeeds(@Res() res): Promise<[]>{
        const speed = [];
        for(let i = 0; i <= 10; i++) {
            speed.push({ id: i.toString(), name: i.toString() });
        } 
        
        return res.status(HttpStatus.OK).json(speed)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/pause')
    async indexSequencesActionParametersPauses(@Res() res): Promise<[]>{
        const pause = [];
        for(let i = 0; i <= 20; i++) {
            pause.push({ id: i.toString(), name: i.toString() + ' Seg' });
        } 
        
        return res.status(HttpStatus.OK).json(pause)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/animation')
    async indexSequencesActionParametersAnimations(@Res() res): Promise<[]>{
        const animationData = [ 'Toda la cruz encendida 4 segundos', 'Contorno de cruz encendido 4 segundos', 'Imagen de Cruz Milenium(Malta) 4 seg.', 'Ola de surf avanzando', 
                                'Cortina con abanico de tijera', 'Cortina con cuadros dispersándose', 'Cortina con estrellas en diagonal', 'Cruz de cristal rompiéndose', 
                                'Cortina con abanico de 360º', 'Cortina con Espiral de 5 brazos', 'Cortina con Espiral de Palmera', 'Cortina con Huella Dactilar', 
                                'Serpiente enroscándose a la copa', 'Cortina con remolino', 'Latidos de corazón', 'Cortina de Manchas', 'Derrame de pintura', 'Cruz girando 360º', 
                                'Cortina con franja diagonal', 'Cortina con franja horizontal deformada', 'Ondas hacia el interior', 'Onda Rebotando', 'Cortina de cuadraditos bajando', 
                                'Cortina de 4 abanicos', 'Cortina de humo ascendente', 'Cortina mordisco vertical', 'Cortina de cuadrícula inundada', 'Cortina de focos', 
                                'Intermitencia de toda la cruz', 'Cortina de cruz de trébol', 'Intermitencia entre centro y contorno', 'Cortina rayos-laser disco', 'Cortina diábolo', 
                                'Cortina molinillo de viento', 'Cortina abanico con 4 cuadros', 'Cortina luz de faro', 'Cortina de abanicos dentados', 'Cortina telón rayado abriéndose', 
                                'Cortina horizontal 4 esquinas', 'Cortina de ondas senoidales', 'Cortina de rombos opuestos', 'Cortina 2 cuadros rebotando', 'Cortina abanico circular', 
                                'Cortina diábolo rebotando', 'Cortina multi-cruces rebotando', 'Cortina de 4 pétalos', 'Cortina con radar de sonar', 'Cortina explosión super-nova', 
                                'Cortina con cruz congelándose', 'Cortina con diagonales acendentes', 'Cortina tornado horizontal', 'Cortina con cruz de agua', 'Cortina con rayos de sol', 
                                'Cortina con pincel de acuarela', 'Cortina con vela encendida (Navidad)', 'Cortina con estrella de oriente (Navidad)', 
                                'Cortina con árbol navideño (Navidad)', 'Cortina con muñeco de nieve (Navidad)', 'Flecha hacia arriba 4 segundos', 'Flecha hacia abajo 4 segundos', 
                                'Flecha hacia la derecha 4 segundos', 'Flecha hacia la izquierda 4 segundos', 'Apagado'
        ];

        const animation = [];
        for(const [propertyKey, propertyValue] of Object.entries(animationData)) {
            animation.push({ id: (parseInt(propertyKey) + 1).toString(), name: propertyValue });
        } 
        
        return res.status(HttpStatus.OK).json(animation)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/sequence/action/color')
    async indexSequencesActionParametersColors(@Res() res): Promise<[]>{
        const rowData = [ 'Color 1', 'Color 2', 'Color combinado' ];

        const row = [];
        for(const [propertyKey, propertyValue] of Object.entries(rowData)) {
            row.push({ id: (parseInt(propertyKey) + 1).toString(), name: propertyValue });
        } 
        
        return res.status(HttpStatus.OK).json(row)
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('/product-type')
    async indexProductType(@Res() res): Promise<[]>{
        const row = [];
        for (const key in ProductType) {
            row.push({id: key, name: ProductType[key]});
        }        
        return res.status(HttpStatus.OK).json(row)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/fringe')
    async indexFringe(@Res() res): Promise<[]>{
        const row = [];        
        for (const key in FringeType) {
            row.push({id: key, name: FringeType[key]});
        }        
        return res.status(HttpStatus.OK).json(row)
    }

    

}