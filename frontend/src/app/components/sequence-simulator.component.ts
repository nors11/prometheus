import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Sequence } from '../modules/products/models/sequence';
import { ProductModel } from '../modules/product-models/models/product-model';
import { Action } from '../modules/products/models/action';
import { 
    dib0, dib1, dib2, dib3, dib4, dib5, dib6, dib7, dib8, dib9, dib10, dib11, dib12, dib13, dib14, dib15, dib16, dib17, dib18, dib19, dib20, dib21, dib22, dib23, dib24, dib25, dib26, privdib00, privdib01, privdib02, privdib03
} from '../constants/simulator/dib/dib';
import { font1 } from '../constants/simulator/fonts/fonts1';
import { font2 } from '../constants/simulator/fonts/fonts2';
import { font3 } from '../constants/simulator/fonts/fonts3';
import { font4 } from '../constants/simulator/fonts/fonts4';
import { CrossSizesConstants } from '../constants/simulator/cross-sizes';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'tecneplas-sequence-simulator',
    templateUrl: '../views/sequence-simulator.component.html'
})
export class SequenceSimulatorComponent implements OnInit, OnDestroy, AfterViewInit {
    public canvas;
    public ctx;
    public bmpApagado;
    public bmpVerde;
    public bmpRojo;
    public bmpAmarillo;
    public bmpBlanco;
    public actionColorImg;
    public actionLed;
    public form;
    public button1;
    public seccion1;
    public seccion2;
    public myLoopTimeout;
    public scrollControl;
    public delayInicioScroll = 1000;
    public delayInicioAnimacion = 1000;
    public tiempoScroll = 30;
    public tiempoTextoScroll = 150;
    public row;
    public col;
    public pos;
    public linea;
    public textMoveState;
    public fin;
    public stop;
    public frameCounter;
    public bytesOffet;
    public framesNum = 0;
    public aniBytes;
    public frameBytes;
    
    public z = 0;
    public end = false;
    public espera = 0;
    public acabar;
    public primera_vez;
    public done = false;
    public contar = 0;
    public letterSize = 40;
    public scape_row;
    public bucle;
    public timeoutId;
    public self;

    //############################################################################## MEDIDAS DE LA CRUZ ##############################################################################
    //Las medidas de la cruz son variables y modifican el tamaño de la cruz. Eso si, que se muestre o no depende de la mascara.
    

    public cross_height;
    public cross_width;
    public mascara = [];
    public num = 0;

    @ViewChild('tecneplasWrapperSimulator') private wrapperSimulator: ElementRef;

    @Input() sequence: Sequence;
    @Input() productModel: ProductModel;
  
    constructor(
        private renderer: Renderer2,
        private crossSizesConstants: CrossSizesConstants,
        private httpClient: HttpClient
    ) { 
        this.frameBytes = new Uint8Array(this.crossSizesConstants.FRAME_SIZE);
    }

    ngOnInit(): void {
        console.log('INIT SEQUENCE SIMULATOR');
        console.log(this.sequence);
        console.log(this.productModel);
    }

    ngAfterViewInit() {    
        this.self = this;
        this.canvas = this.renderer.createElement('canvas'); 
        this.canvas.width = 560;
        this.canvas.height = 560;
        this.wrapperSimulator.nativeElement.appendChild(this.canvas)
        this.ctx = this.canvas.getContext("2d");
        this.bmpApagado = this.renderer.createElement('img');
        this.bmpApagado.src = "assets/img/simulator/led_negro_10.bmp";
        this.bmpVerde = this.renderer.createElement('img');
        this.bmpVerde.src = "assets/img/simulator/led_verde_negro_10.bmp";
        this.bmpRojo = this.renderer.createElement('img');
        this.bmpRojo.src = "assets/img/simulator/led_rojo_negro_10.bmp";
        this.bmpAmarillo = document.createElement('img');
        this.bmpAmarillo.src = "assets/img/simulator/led_amarillo_negro_10.bmp";
        this.bmpBlanco = document.createElement('img');
        this.bmpBlanco.src = "assets/img/simulator/led_blanco_10.bmp";


        setTimeout(() => {
            this.endSimulation()
            this.startSimulation();
        }, 500);
    }

    ngOnDestroy(){
        console.log('DESTROY SEQUENCE SIMULATOR')
        clearInterval(this.scrollControl);
        clearTimeout(this.myLoopTimeout);
        this.endSimulation();
    }

    startSimulation() {
        this.espera = 0;
        this.z = 0;
        this.acabar = 0;
        this.end = false;
        this.fin = true;
        this.primera_vez = true;
        this.done = false;
        this._myLoop();
    }

    endSimulation() {
        this.fin = true;
        this.end = true;
    }

    stopAnimation() {
        this.stop = true;
        this.end = true;
    }



    /*********************************************************************************
    ******************************** PRIVATE FUNCTIONS *******************************
    **********************************************************************************/

    /**
     * Funcion bucle que ejecuta las acciones de la secuencia de manera ciclica.
     */
    _myLoop() {
        this.myLoopTimeout = setTimeout(() => {
            if (this.fin) {
                this._showAction(this.sequence.actions[this.z]);
                //Realizamos siguiente accion
                this.z++;
                //Si se ha llegado al final de la secuencia, vuelta al principio
                if (this.z >= this.sequence.actions.length) {
                    this.z = 0;
                }
            }
        
            // Mientras no se pare y no se esté reproduciendo una animación, se continua de forma cíclica
            if (!this.end) {
                this._myLoop();
            } else {
                // isAnimatig = false; // Controlar restablecer la bandera si se detiene la secuencia
            }
        }, this.espera) // Espera entre acciones
    }

    /**
     * Funcion que obtiene los parametros de las acciones dentro de una secuencia y la ejecuta.
     * 
     * @param {*} action accion de la secuencia a realizar
     */
    _showAction(action: Action) {
        this.espera = 0; //Tiempo de espera entre acciones

        let mensaje = '';
        switch (action.type) {
            case 'temperature':
                mensaje = "24º";
                break;

            case 'time':
                var date = new Date();
                let currentHour = String(date.getHours()).padStart(2, '0');
                let currentMinute = String(date.getMinutes()).padStart(2, '0');
                mensaje = `${currentHour}:${currentMinute}`;
                break;

            case 'weather':
                mensaje = "Assoleiat amb núvols";
                break;

            case 'saints':
                mensaje = "AVUI ÉS SANT FRUTINI";
                break;

            case 'image':
                mensaje = "Imagen";
                action.parameters.top_drawing = 0; 
                action.parameters.bottom_drawing = 0;
                action.parameters.effect = 5;
                action.parameters.delete_single_row = true;
                action.parameters.delete_all = true;
                action.parameters.text_in_out = true;
                action.parameters.text_only_in = false; 
                action.parameters.font_size = 1;
                action.parameters.color = 0,    
                action.parameters.led = 3;
                action.parameters.orla = false, 
                action.parameters.speed = 5;
                action.parameters.pause = 2;
                break;

            case 'humidity':
                mensaje = "HUMITAT: 65%";
                break;

            case 'date':
                var date = new Date();
                let currentDay = String(date.getDate()).padStart(2, '0');
                let currentMonth = String(date.getMonth() + 1).padStart(2, '0');
                let currentYear = date.getFullYear();
                mensaje = `${currentDay}/${currentMonth}/${currentYear}`;
                break;

            case 'text':
                mensaje = action.parameters.message;
                break;

            case 'animation':
                mensaje = "Animación";
                break;

            default:
                mensaje = "LA MEJOR FARMACIA";
        }
        
        this.animation(action, mensaje);
    }

    /**
     * Funcion que realiza las acciones de una secuencia. Inicia extrayendo valores necesarios para mostrar la animacion,
     * seguidamente dibuja la cruz segun los parametros indicados, y finalmente ejecuta el efecto seleccionado. Las medidas 
     * se realizan dentro de un rango de 56x56, pero los "leds" del simulador ocupan 10 pixeles, por lo que los valores se 
     * tienen que multiplicar por 10 para indicar la posicion en la pantalla.
     * 
     * @param {Action} action contiene los parametros de la accion actual.
     * @param {string} action_message mensaje a mostrar en los efectos.
     */
    animation(action: Action, action_message: string) {
        //Limpiamos el panel y indicamos el inicio de la secuencia
        clearInterval(this.scrollControl);

        //Inidcamos cuales son los parametros de altura y longitud de la cruz para poder trabajar con ellos.
        this.cross_height = this.crossSizesConstants.topPanel_Y + this.crossSizesConstants.middlePanel_Y + this.crossSizesConstants.bottomPanel_Y + this.crossSizesConstants.topEdge + this.crossSizesConstants.bottomEdge;
        this.cross_width = Math.max(this.crossSizesConstants.topPanel_X, this.crossSizesConstants.middlePanel_X, this.crossSizesConstants.bottomPanel_X) + this.crossSizesConstants.leftEdge + this.crossSizesConstants.rightEdge;

        //================= SELECTION ANIMACION FICHERO LED =====================
        if (action.type == 'animation') {
            //Reset de valores
            this.fin = false;

            //Llamada al inicio de la animacion
            this._playAnimacion(action);
        }
        else {
            //================= CALCULAMOS EL VALOR DEL PARAMETRO LED SI NO EXISTE =================
            this.actionLed = (!action.parameters.led) ? this._calculateLedPosition(action) : action.parameters.led - 1;

            //================== SELECCION DE TIPOGRAFIA A UTILIZAR ==================
            var font;
            if (action.parameters.font_size === 2) { 
                //Letra GRANDE
                font = action.parameters.font_family === 1 ? font3 : font4; //Font a usar
                this.row = (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y) * 10; //Fila donde mostrar los datos
            } else {
                //Letra pequeña
                font = action.parameters.font_family === 1 ? font1 : font2; //Font a usar
                this.row = (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y + this.actionLed) * 10; //Fila donde mostrar los datos
            }
            
            this.bucle = font[action_message[0]].length - 1; //Altura del texto




            // ================== SELECCION DE OFFSET ==================
            //Miramos el tamaño del mensaje a mostrar para poder centrarlo en la cruz
            let offset = 0;
            for (let i = 0; i < action_message.length; i++) {
                offset = offset + font[action_message[i]][0].length;
            }
            //Evitamos que quede un numero impar que descuadre el texto
            while ((this.cross_width - offset) % 2 != 0 ) {
                offset++;
            }
            
            //Dividimos por la mitad para saber cuanto se separa del cento del panel
            this.col = (((this.cross_width - offset)/2)+1)*10;



            //================== DIBUJAMOS LA CRUZ ==================
            var x = 0;
            var y = 0;
            
            //Integramos las mascaras todo en uno
            this._checkArrays();

            for (var i = 0; i < this.cross_height; i++) { //i = y
                for (var j = 0; j < this.cross_width; j++) { // j = x
                
                    //Dibujamos orla si se indica con el color escogido si dispone de el
                    //Si es bicolor, puede tener los tres
                    if (action.parameters.orla == true) { 
                        if ((this.mascara[i][j] == 4 || this.mascara[i][j] == 6) && action.parameters.color == 1) { //Puede verde o bicolor, selecciona verde
                            this.ctx.drawImage(this.bmpVerde, x, y);
                
                        } else if ((this.mascara[i][j] == 5 || this.mascara[i][j] == 6) && action.parameters.color == 2) { //Puede rojo o bicolor, selecciona rojo
                            this.ctx.drawImage(this.bmpRojo, x, y);
                        } else if (this.mascara[i][j] == 6 && action.parameters.color == 3) { //Puede bicolor, selecciona bicolor
                            this.ctx.drawImage(this.bmpAmarillo, x, y);
                
                        } else if (this.mascara[i][j] == 4) { //Solo puede verde y seleccion no coincide
                            this.ctx.drawImage(this.bmpVerde, x, y);
                        } else if (this.mascara[i][j] == 5) { //Solo puede rojo y seleccion no coincide
                            this.ctx.drawImage(this.bmpRojo, x, y);
                        }
                        
                    } else if ( action.parameters.orla == false && (this.mascara[i][j] == 4 || this.mascara[i][j] == 5 || this.mascara[i][j] == 6)) {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                
                    if (this.mascara[i][j] == 0 ) {
                        this.ctx.drawImage(this.bmpBlanco, x, y);
                    }
                
                    //Dibujamos la cruz
                    if (this.mascara[i][j] > 0 && this.mascara[i][j] < 4) {
                
                        //Borramos toda la cruz si se indica o si se trata de la primera ejecucion de animación
                        if (action.parameters.delete_all || this.primera_vez) {
                            this.ctx.drawImage(this.bmpApagado, x, y);
                
                        } else if (action.parameters.delete_single_row && y >= (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y + this.actionLed)*10 && y < (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y + this.actionLed + font[action_message[0]].length)*10) {
                            //Borramos a partir de la linia de leds que se indique y la altura del texto
                            this.ctx.drawImage(this.bmpApagado, x, y);
                        }
                    }
                    x+=10;
                }
                x=0;
                y+=10;
            }
            
            this.primera_vez = false;

    

            //================== COLOR DEL TEXTO ==================
            //Miramos que colores permite la cruz a partir de la mascara integrada 
            if (this._findValue(this.mascara, 3) && action.parameters.color == 3) {
                this.actionColorImg = this.bmpAmarillo;
        
            } else if ((this._findValue(this.mascara, 2) || this._findValue(this.mascara, 3)) && action.parameters.color == 2) {
                this.actionColorImg = this.bmpRojo;
            } else {
                this.actionColorImg = this.bmpVerde;
            }
    


            //================== DIBUJOS PANEL SUPERIOR Y INFERIOR ==================
            this._dibujarDib((this.cross_width/2 + this.crossSizesConstants.topPanel_X/2 - 1)*10, (this.crossSizesConstants.topEdge+this.crossSizesConstants.topPanel_Y-1)*10, this._getDib("dib"+(action.parameters.top_drawing-1)), this.actionColorImg, "top");// Dibuja la cruz de arriba
            this._dibujarDib((this.cross_width/2 + this.crossSizesConstants.bottomPanel_X/2 - 1)*10 , (this.cross_height-this.crossSizesConstants.bottomEdge-1)*10, this._getDib("dib"+(action.parameters.bottom_drawing-1)), this.actionColorImg, "bottom");// Dibuja la cruz de abajo
        
            //Reset de valores
            this.fin = false;
            this.linea = 0;
            this.textMoveState = 0;
            this.contar = 0;
    

            
            //================== EJECUCION DE EFECTOS ==================
            if (action.parameters.effect == 1) { // Desplazamiento Arriba
                this.row = ((this.cross_height - this.crossSizesConstants.bottomPanel_Y - this.crossSizesConstants.bottomEdge) * 10) - 10;
                this.scrollControl = setInterval(() => this._ponerTextoV(action_message, this.row, "U", action.parameters.speed, font, action.parameters.pause, this.bucle, action.parameters.text_only_in, offset, this.actionLed, action.parameters.font_size, this.actionColorImg), this.delayInicioScroll);
            } else if (action.parameters.effect == 2) { // Desplazamiento Abajo
                this.row = (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y) * 10;
                this.scrollControl = setInterval(() => this._ponerTextoV(action_message, this.row, "D", action.parameters.speed, font, action.parameters.pause, this.bucle, action.parameters.text_only_in, offset, this.actionLed, action.parameters.font_size, this.actionColorImg), this.delayInicioScroll);

            } else if (action.parameters.effect == 4) { // Desplazamiento Derecha
                this.col = (this.crossSizesConstants.leftEdge - offset) * 10;
                this.scrollControl = setInterval(() => this._ponerTexto(action_message, "D", action.parameters.speed, font, action.parameters.pause, action.parameters.text_in_out, action.parameters.text_only_in, offset, this.actionColorImg), this.delayInicioScroll);

            } else if (action.parameters.effect == 5) { // Desplazamiento Fija
                this.scrollControl = setInterval(() => this._ponerTextoStatico(action_message,  "F", font, action.parameters.speed, action.parameters.pause, this.actionColorImg), this.delayInicioScroll);
            } else if (action.parameters.effect == 6) { // Desplazamiento Fija Parpadeante
                this.scrollControl = setInterval(() => this._ponerTextoStatico(action_message,  "FP", font, action.parameters.speed, action.parameters.pause, this.actionColorImg), this.delayInicioScroll);
            } else { // Desplazamiento Izq
                this.col = (this.cross_width-this.crossSizesConstants.rightEdge)*10;
                this.scrollControl = setInterval(() => this._ponerTexto(action_message, "I", action.parameters.speed, font, action.parameters.pause, action.parameters.text_in_out, action.parameters.text_only_in, offset, this.actionColorImg), this.delayInicioScroll);
            }
        }
    }


    /**
     * Funcion que integra las cuatro mascaras de diseño en la cruz en una unica mascara, indicando
     * la forma de la cruz (cruz + orla) y de que colores dispone.
     * 
     * @param maskContent Json con las macaras de la cruz, dos correspondientes a la cruz y 
     * otras dos a la orla, una por color. Tener en cuenta que si hubieran mas mascaras, hay 
     * que modificar el codigo.
     */
    _checkArrays() {
        let productModelMask = this.productModel.masks[0];
        this.mascara = [];
    
        //Inicializamos la mascara a todo 0
        for (var i = 0; i < this.cross_height; i++) {
            this.mascara[i] = [];
            for(var j = 0; j < this.cross_width; j++) {
                this.mascara[i][j] = 0;
            }
        }
    
        //Numeros correspondientes a los colores en funcion de si son cruz o orla 
        const BLANCO = 0;
        const VERDE_CRUZ = 1;
        const ROJO_CRUZ = 2;
        const BICOLOR_CRUZ = 3;
        const VERDE_ORLA = 4;
        const ROJO_ORLA = 5;
        const BICOLOR_ORLA = 6;
    
    
        // Primera mascara de la cruz (Verde)
        if (productModelMask['mask_coreFC1'].length != 0) {
            for (var i = 0; i < productModelMask['mask_coreFC1'].length; i++) {
                for(var j = 0; j < productModelMask['mask_coreFC1'][i].length; j++) {
                    if (productModelMask['mask_coreFC1'][i][j] == 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = BLANCO;
                    } else if (productModelMask['mask_coreFC1'][i][j] != 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = VERDE_CRUZ;
                    } else if (productModelMask['mask_coreFC1'][i][j] != 65535 && this.mascara[i][j] == ROJO_CRUZ) {
                        this.mascara[i][j] = BICOLOR_CRUZ;
                    }
                }
            }
        }
        
        // Segunda mascara de la cruz (Rojo)
        if (productModelMask['mask_coreFC2'].length != 0) {
            for (var i = 0; i < productModelMask['mask_coreFC2'].length; i++) {
                for(var j = 0; j < productModelMask['mask_coreFC2'][i].length; j++) {
                    if (productModelMask['mask_coreFC2'][i][j] == 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = BLANCO;
                    } else if (productModelMask['mask_coreFC2'][i][j] != 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = ROJO_CRUZ;
                    } else if (productModelMask['mask_coreFC2'][i][j] != 65535 && this.mascara[i][j] == VERDE_CRUZ) {
                        this.mascara[i][j] = BICOLOR_CRUZ;
                    }
                }
            }
        }
    
        // Primera mascara de la orla (Verde)
        if (productModelMask['mask_orlaFC1'].length != 0) {
            for (var i = 0; i < productModelMask['mask_orlaFC1'].length; i++) {
                for(var j = 0; j < productModelMask['mask_orlaFC1'][i].length; j++) {
                    if (productModelMask['mask_orlaFC1'][i][j] == 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = BLANCO;
                    } else if (productModelMask['mask_orlaFC1'][i][j] != 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = VERDE_ORLA;
                    } else if (productModelMask['mask_orlaFC1'][i][j] != 65535 && this.mascara[i][j] == ROJO_ORLA) {
                        this.mascara[i][j] = BICOLOR_ORLA;
                    }
                }
            }
        }
    
        // Segunda mascara de la orla (Rojo)
        if (productModelMask['mask_orlaFC2'].length != 0) {
            for (var i = 0; i < productModelMask['mask_orlaFC2'].length; i++) {
                for(var j = 0; j < productModelMask['mask_orlaFC2'][i].length; j++) {
                    if (productModelMask['mask_orlaFC2'][i][j] == 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = BLANCO;
                    } else if (productModelMask['mask_orlaFC2'][i][j] != 65535 && this.mascara[i][j] == BLANCO) {
                        this.mascara[i][j] = ROJO_ORLA;
                    } else if (productModelMask['mask_orlaFC2'][i][j] != 65535 && this.mascara[i][j] == VERDE_ORLA) {
                        this.mascara[i][j] = BICOLOR_ORLA;
                    }
                }
            }
        }
    }


    /**
     * Funcion encargada de indicar si un numero se encuentra dentro de un array de dos dimensiones.
     * 
     * @param   array cadena de 2 dimensiones donde se buscara el valor
     * @param   num valor a encontrar en el array
     * @returns True si el valor se encuentra dentro del array y false en caso contratio
     */
    _findValue(array, num) {
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i].length; j++) {
                if (array[i][j] == num) {
                    return true;
                }
            }
        }
        return false;
    }


    /**
     * Funcion que genera los dibujos en los paneles superior e inferior de la cruz
     * 
     * @param {*} posx Posicion del eje de las X en la Web (columnas)
     * @param {*} posy Posicion del eje de las Y en la Web (fila)
     * @param {*} bufDib Dibujo de js/dib/dib.js a realizar 
     * @param {*} color Color en que mostrar la letra
     * @param {*} position Inidica con que panel se trabaja
     */
    _dibujarDib(posx, posy, bufDib, color, position) {
        let y = 0;
        let i;
        let j;
        let datosDib;
        let byteDib = 0;
        let bitMask;
        let x = posx;
        y = posy;
    
        if (position == "top") {
            for (j = 0; j < this.crossSizesConstants.topPanel_X; j++) {
                bitMask = 0x2000;
                datosDib = (bufDib[byteDib] << 8) | bufDib[byteDib + 1];
                for (i = 0; i < this.crossSizesConstants.topPanel_Y; i++) {
                    if (!(datosDib & bitMask)) {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    } else {
                        this.ctx.drawImage(color, x, y);
                    }
                    bitMask = bitMask >> 1;
                    x = x - 10;
                }
                x = posx;
                y = y - 10;
                byteDib = byteDib + 2;
            }
        } else if (position == "bottom") {
            for (j = 0; j < this.crossSizesConstants.bottomPanel_X; j++) {
                bitMask = 0x2000;
                datosDib = (bufDib[byteDib] << 8) | bufDib[byteDib + 1];
                for (i = 0; i < this.crossSizesConstants.bottomPanel_Y; i++) {
                    if (!(datosDib & bitMask)) {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                    else {
                        this.ctx.drawImage(color, x, y);
                    }
                    bitMask = bitMask >> 1;
                    x = x - 10;
                }
                x = posx;
                y = y - 10;
                byteDib = byteDib + 2;
            }
        }
    }


    //==================================================================================================================================================================================================================================================================
    
    
    //Funcion carga el fichero .led para procesarlo
    _playAnimacion(action:Action) {
        this.httpClient.get(action.parameters.path, { responseType: 'blob'}).subscribe(data => {
            const reader = new FileReader();
            reader.readAsDataURL(data);

            reader.onload = (e) => {
                const fileData = (e.target.result as string).split(',')[1]; // Obtener los datos en base64
                this.aniBytes = new Uint8Array(atob(fileData).split("").map(function (c) { return c.charCodeAt(0); }));
                this.framesNum = Math.ceil(this.aniBytes.length / this.crossSizesConstants.BLOCK_SIZE); //Redondeo para que framesNum pueda compararse con FramesCounter
                this.frameCounter = 0;
                this.bytesOffet = 0;

            this.stop = false;
            this.stop = false;

                this.stop = false;

                this._dibujarMascara();
                this.scrollControl = setInterval(() => this._dibujarAnimacion(), this.delayInicioAnimacion);
            };
        });
    }

    // Funcion dibuja las mascaras de las animaciones LED
    _dibujarMascara() {
        let productModelMask = this.productModel.masks[0];

        if (
            productModelMask['mask_coreFC1'].length !== productModelMask['mask_coreFC2'].length ||
            productModelMask['mask_coreFC1'][0].length !== productModelMask['mask_coreFC2'][0].length ||
            productModelMask['mask_coreFC1'].length !== productModelMask['mask_orlaFC1'].length ||
            productModelMask['mask_coreFC1'][0].length !== productModelMask['mask_orlaFC1'][0].length ||
            productModelMask['mask_coreFC1'].length !== productModelMask['mask_orlaFC2'].length ||
            productModelMask['mask_coreFC1'][0].length !== productModelMask['mask_orlaFC2'][0].length
        ) {
            console.error("Las matrices deben tener el mismo tamaño.");
            return;
        }
        
        // Define la forma de la suma de las cuatro matrices
        // Puntos recibidos != 65535, son los que marcan donde se vera la animacion
        // Inicio de camino
        this.ctx.beginPath();
        for (let i = 0; i < productModelMask['mask_coreFC1'].length; i++) {
            for (let j = 0; j < productModelMask['mask_coreFC1'][i].length; j++) {
                if (
                    productModelMask['mask_coreFC1'][i][j] !== 65535 ||
                    productModelMask['mask_coreFC2'][i][j] !== 65535 ||
                    productModelMask['mask_orlaFC1'][i][j] !== 65535 ||
                    productModelMask['mask_orlaFC2'][i][j] !== 65535
                ) {
                    this.ctx.rect(i * 10, j * 10, 10, 10);
                }
            }
        }
        //Cierre de camino
        this.ctx.closePath();
    
        // Aplica el recorte
        this.ctx.clip("evenodd");
    
        // Llena el fondo con el color de fondo deseado
        this.ctx.fillStyle = "black"; // Cambia esto al color de fondo deseado
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ======  FUNCION DIBUJA ANIMACION DEL FICHERO LED ================ //
    _dibujarAnimacion() {
        clearInterval(this.scrollControl);

        let x = 0;
        let y = 0;
        let i;
        let j;
        let LEDColor1;
        let LEDColor2;
        let LEDColor3;
        let LEDColor4;
    
        // Leer pausa
        let framePause = 0;
        framePause = (this.aniBytes[this.bytesOffet + 3] << 8) + this.aniBytes[this.bytesOffet + 4];
        framePause = framePause * this.crossSizesConstants.PAUSE_MS;
        this.bytesOffet = this.bytesOffet + 6;
        
        // Llama a la función para dibujar la máscara en el lienzo principal
        for (let n = 0; n < this.crossSizesConstants.FRAME_SIZE; n++) {
            this.frameBytes[n] = this.aniBytes[n + this.bytesOffet];
        }
        this.bytesOffet += this.crossSizesConstants.FRAME_SIZE;
        let contadorLed = 0;
        let contadorFila = 0;
        x = 0;
        y = 0;
        
        for (i = 0; i < this.frameBytes.length; i++) {
        
            // procesar byte de streamBMP
            let datoLed = this.frameBytes[i];
            let colorMask1 = 0b11000000;
            let colorMask2 = 0b00110000;
            let colorMask3 = 0b00001100;
            let colorMask4 = 0b00000011;
        
            // obtener color de cada LED en las posiciones de la máscara
            LEDColor1 = datoLed & colorMask1;
            LEDColor2 = datoLed & colorMask2;
            LEDColor3 = datoLed & colorMask3;
            LEDColor4 = datoLed & colorMask4;
    
        
            switch (LEDColor1) {
                case 0:
                    this.ctx.drawImage(this.bmpApagado, x, y);
                    break;
                case 0b01000000:
                    this.ctx.drawImage(this.bmpVerde, x, y);
                    break;
                case 0b10000000:
                    this.ctx.drawImage(this.bmpRojo, x, y);
                    break;
                default:
                    this.ctx.drawImage(this.bmpApagado, x, y);
            }
            
            x += 10;
    
            switch (LEDColor2) {
                case 0:
                    this.ctx.drawImage(this.bmpApagado, x, y);
                    break;
                case 0b00010000:
                    this.ctx.drawImage(this.bmpVerde, x, y);
                    break;
                case 0b00100000:
                    this.ctx.drawImage(this.bmpRojo, x, y);
                    break;
                default:
                    this.ctx.drawImage(this.bmpApagado, x, y);
            }
        
            x += 10;
    
            switch (LEDColor3) {
                case 0:
                    this.ctx.drawImage(this.bmpApagado, x, y);
                    break;
                case 0b00000100:
                    this.ctx.drawImage(this.bmpVerde, x, y);
                    break;
                case 0b00001000:
                    this.ctx.drawImage(this.bmpRojo, x, y);
                    break;
                default:
                    this.ctx.drawImage(this.bmpApagado, x, y);
            }
        
            x += 10;
        
            switch (LEDColor4) {
                case 0:
                    this.ctx.drawImage(this.bmpApagado, x, y);
                    break;
                case 0b00000001:
                    this.ctx.drawImage(this.bmpVerde, x, y);
                    break;
                case 0b00000010:
                    this.ctx.drawImage(this.bmpRojo, x, y);
                    break;
                default:
                    this.ctx.drawImage(this.bmpApagado, x, y);
            }

            x += 10;
            contadorLed++;
    
            // control de línea
            if (contadorLed == 14) {
                contadorLed = 0;
                contadorFila++;
                x = 0;
                y += 10;
            }
        }

        // Verifica si se han ejecutado todos los cuadros de la animacion led
        if (this.frameCounter >= this.framesNum - 1 ) {
            this.fin = true;
            this.stop = true; 
            this.done = false;
        }

        this.frameCounter++;

        this.scrollControl = setInterval(() => this._dibujarAnimacion(), framePause);
    }

    /**
     * Funcion que hace aparecer por el borde superior las letras en el caso DOWN. Primero de los 
     * casos del desplazamiento
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} row Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @param {int} bucle Altura de las letras
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraV11(posx, row, buffLetra, color, font, bucle) {
        let x;
        let y;
        let letraLength;
    
        x = posx;
        y = row;
    
        for (let i = this.bucle; i < font[buffLetra].length; i++) {
            letraLength =  font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    } else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
        }
        return 10 * letraLength;
    }
  
  
  
    /**
     * Funcion que desplaza el mensaje hacia abajo mientras no tenga que aparecer o desaparecer 
     * por algun borde. Segundo caso del desplazamiento DOWN.
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} row Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraV12(posx, row, buffLetra, color, font) {
        let x;
        let y;
        let letraLength;
    
        x = posx;
        y = row;
    
        for (let i = 0; i < font[buffLetra].length; i++) {
            letraLength =  font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    }
                    else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
    
        }
        return 10 * letraLength;
    }
  
  
  
    /**
     * Funcion que hace desaparecer las letras por el borde inferior. Tercer y ultimo caso de 
     * deplazamiento DOWN
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} row Posicion del eje de las Y en la Web (fila)
     * @param {int} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @param {int} bucle Altura de las letras
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraV13(posx, row, buffLetra, color, font, bucle) {
        let x;
        let y;
        let letraLength;
    
        x = posx;
        y = row;
    
        for (let i = 0; i < font[buffLetra].length-bucle; i++) {
            letraLength =  font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    }
                    else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;    
        }
        return 10 * letraLength;
    }
  
  
  
    /**
     * Funcion que hace aparecer las letras por el borde inferior. Primer caso de
     * deplazamiento UP
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} row Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @param {int} bucle Altura de las letras
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraV21(posx, row, buffLetra, color, font, bucle) {
        let x;
        let y;
        let letraLength;
    
        x = posx;
        y = row;
    
        for (let i = 0; i < font[buffLetra].length - bucle; i++) {
            letraLength =  font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    } else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
        }
        return 10 * letraLength;
    }
  
  
  
    /**
     * Funcion que desplaza el mensaje hacia arriba mientras no tenga que aparecer o desaparecer 
     * por algun borde. Segundo caso del desplazamiento UP.
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} row Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraV22(posx, row, buffLetra, color, font) {
        let x;
        let y;
        let letraLength;
    
        x = posx;
        y = row;
    
        for (let i = 0; i < font[buffLetra].length; i++) {
            letraLength =  font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    }
                    else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
        }
        return 10 * letraLength;
    }
  
  
  
    /**
     * Funcion que hace desaparecer las letras por el borde superior. Tercer y ultimo caso de 
     * deplazamiento UP
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} row Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @param {int} bucle Altura de las letras
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraV23(posx, row, buffLetra, color, font, bucle) {
        let x;
        let y;
        let letraLength;
    
        x = posx;
        y = row;
    
        for (let i = bucle; i < font[buffLetra].length; i++) {
            letraLength =  font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    } else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;    
        }
        return 10 * letraLength;
    }
  
  
  
    /**
     * Funcion correspondiente a los efectos de las animaciones de ABAJO y ARRIBA.
     * 
     * @param {string} texto mensaje a mostrar.
     * @param {int} row posicion del eje Y en la web. 
     * @param {char} dir indica la direccion del efecto, D (down) y U (up).
     * @param {int} speed velocidad de movimiento del texto.
     * @param {*} font tipografia con la que representar el texto.
     * @param {int} pause tiempo de espera que realizara el efecto.
     * @param {int} bucle mumero de veces que se ejecutaran las funciones de aparecer y desaparecer el 
     *              texto por los limites de la cruz. El valor corresponde a la altura de las letras 
     *              del mensaje
     * @param {boolean} stop_middle indica si hay pausa en el muestreo
     * @param {int} offset separacion del inicio del texto respecto al centro del panel a fin de que el 
     *            mensaje salga centrado
     * @param {int} fila numero de fila de leds a partir del que se mostrara el mensaje.
     * @param {int} size tamaño de la fuente.
     * @param {*} color color en que mostrar el texto en caso de que la cruz lo permita.
     * 
     * done => indica si se ha realizado la pausa o si es necesaria.
     * textMoveState => estado en el que se encuentra la animación.
     */
    _ponerTextoV(texto, row, dir, speed, font, pause, bucle, stop_middle, offset, fila, size, color) {
    
        clearInterval(this.scrollControl);
        this.pos = this.col;
    
        //CASO HACIA ABAJO
        if (dir == "D") {
            switch (this.textMoveState) {
                case 0: //Texto aparece poco a poco desde el panle superior
                    for (let iletra = 0; iletra < texto.length; iletra++) {
                        this.pos += this._ponLetraV11(this.pos, row+(bucle%1)*10, texto[iletra], color, font, bucle);
                    }
                    bucle--;
                    if (bucle <= 0) {
                        this.textMoveState++;
                    }
                    break;
        
                case 1: //Texto se desplaza hacia abajo
                    //Miramos si es necesario realizar pausa.
                    if (pause > 0 && this.contar == 0) {
        
                        //Tamaño de letra pequeña y en que posicion se realiza la pausa
                        if (size == 0) {
                            if (row > (this.crossSizesConstants.topEdge+this.crossSizesConstants.topPanel_Y+fila)*10) {
                                this.done = true;
                                this.contar++;
                            }
                        //Tamaño de letra GRANDE. Posicion solo a partir de panel superior
                        } else {
                            if (row > (this.crossSizesConstants.topEdge+this.crossSizesConstants.topPanel_Y)*10) {
                                this.done = true;
                                this.contar++;
                            }
                        }
            
                        //Tiempo de espera
                        if (this.contar > 0) {
                            setTimeout(() => {
                                if (stop_middle) {
                                    this.acabar++;
                                } else {
                                    this.done = false;
                                }
                                if (size == 1) {
                                    this.linea=this.crossSizesConstants.middlePanel_Y - font[texto[0]].length + 3;
                                }
                            }, pause*1000);
                        } 
                    }
                
                    //Mientras no se deba realizar la pausa, deplazamiento del texto hacia abajo
                    if (!this.done) {
                        if (row < (this.cross_height-this.crossSizesConstants.bottomPanel_Y-this.crossSizesConstants.bottomEdge-6)*10-70*size) {
                            if (this.linea != 0) {
                                for (let i = (this.cross_width-offset)/2; i < (this.cross_width+offset)/2; i++) {
                                    if (i >= this.crossSizesConstants.leftEdge && i < this.cross_width-this.crossSizesConstants.rightEdge) {
                                        this.ctx.drawImage(this.bmpApagado, (10 * i), row - 10);
                                    }
                                }
                            }
                            for (let iletra = 0; iletra < texto.length; iletra++) {
                                this.pos += this._ponLetraV12(this.pos, row, texto[iletra], color, font);
                            }
                        }
                        
                        this.linea++;
                        row += 10;
            
                        //Cuando la parte inferior del texto llegue al panel inferior, pasamos al ultimo estado
                        if (this.linea > (this.crossSizesConstants.middlePanel_Y - font[texto[0]].length + 1)) {
                            this.textMoveState++;
                            this.linea--;
                            row-=10;
                            this.scape_row = row;
                            bucle = 1;
                        }
                    }
                    
                    break;
        
                case 2: //Texto desaparece por el final
                    for (let i = (this.cross_width-offset)/2; i < (this.cross_width+offset)/2; i++) {
                        if (i >= this.crossSizesConstants.leftEdge && i < this.cross_width-this.crossSizesConstants.rightEdge ) {
                            this.ctx.drawImage(this.bmpApagado, (10 * i), this.scape_row-10 );
                        }
                    }
        
                    for (let iletra = 0; iletra < texto.length; iletra++) {
                        this.pos += this._ponLetraV13(this.pos, this.scape_row, texto[iletra], color, font, bucle);
                    }
        
                    this.linea++;
                    bucle++;
                    this.scape_row += 10;
                    if (this.linea > this.crossSizesConstants.middlePanel_Y) {
                        this.acabar++;
                    }
                    break;
            }
        //CASO HACIA ARRIBA
        } else if (dir == "U") {
            switch (this.textMoveState) {
                case 0: //Texto aparece poco a poco desde el panle inferior
                    for (let iletra = 0; iletra < texto.length; iletra++) {
                        this.pos += this._ponLetraV21(this.pos, row, texto[iletra], color, font, bucle);
                    }
            
                    bucle--;
                    row -= 10;
                    if (bucle <= 0) {
                        this.textMoveState++;
                        this.scape_row = ((this.cross_height - this.crossSizesConstants.bottomPanel_Y - this.crossSizesConstants.bottomEdge) * 10);
                    }
                    break;
        
                case 1://Texto se desplaza hacia arriba
                    //Miramos si es necesario realizar pausa.
                    if (pause > 0 && this.contar == 0) {
                        if (row < (this.crossSizesConstants.topEdge+this.crossSizesConstants.topPanel_Y+fila)*10) {
                            this.done = true;
                            this.contar++;
                        }
            
                        if (this.contar > 0) {
                            setTimeout(() => {
                                this.done = false;
                                if (stop_middle) {
                                    this.acabar++;
                                }
                            }, pause*1000);
                        }
                    }
                    
                    //Mientras no de deba realizar la pausa, desplazamiento de texto hacia arriba
                    if (!this.done) {
                        if (row >= (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y)*10) {
                            for (let iletra = 0; iletra < texto.length; iletra++) {
                                this.pos += this._ponLetraV22(this.pos, row, texto[iletra], color, font);
                            }
                
                            for (let i = (this.cross_width-offset)/2; i < (this.cross_width+offset)/2; i++) {
                                if (i >= this.crossSizesConstants.leftEdge && i < this.cross_width-this.crossSizesConstants.rightEdge && this.scape_row < (this.cross_height - this.crossSizesConstants.bottomPanel_Y - this.crossSizesConstants.bottomEdge)*10) {
                                    this.ctx.drawImage(this.bmpApagado, (10 * i), this.scape_row);
                                }
                            }
                        }
            
                        row -= 10;
                        this.scape_row -= 10;
                        this.linea++;
                    }
                    
                    //Cuando la parte superior del texto llegue al panel superior, pasamos al ultimo estado
                    if (this.linea > (this.crossSizesConstants.middlePanel_Y - font[texto[0]].length + 1)) {
                        this.textMoveState++;
                        bucle = 1;
                        row = (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y) * 10;
                        this.scape_row+=10;
                    }
                    break;
        
                case 2://Texto desaparece por el final.
                    for (let iletra = 0; iletra < texto.length; iletra++) {
                        this.pos += this._ponLetraV23(this.pos, row, texto[iletra], color, font, bucle);
                    }
            
            
                    for (let i = (this.cross_width-offset)/2; i < (this.cross_width+offset)/2; i++) {
                        if (i >= this.crossSizesConstants.leftEdge && i < this.cross_width-this.crossSizesConstants.rightEdge ) {
                            this.ctx.drawImage(this.bmpApagado, (10 * i), this.scape_row);
                        }
                    }
            
                    this.linea++;
                    bucle++;
                    this.scape_row -= 10;
                    if (this.linea > this.crossSizesConstants.middlePanel_Y) {
                        this.acabar++;
                    }
                    break;
            }
        }
    
        //Si se indica, finalizamos
        if (this.acabar > 0) {
            this.fin = true;
            this.done = false;
            this.acabar = 0;
            this.contar = 0;
        }
    
        if (this.fin == false) {
            this.scrollControl = setInterval(() =>this._ponerTextoV(texto, row, dir, speed, font, pause, bucle, stop_middle, offset, fila, size, color), this.tiempoScroll-(speed*2));
        }
    }


    //==================================================================================================================================================================================================================================================================
    
    
    /**
     *  Funcion que posiciona las letras hacia la izquierda.
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} posy Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraIzquierda(posx, posy, buffLetra, color, font) {
        let x, y;
        let letraLength;
        x = posx;
        y = posy;
        
        for (let i = 0; i < font[buffLetra].length; i++) {
            letraLength = font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x < (this.cross_width - this.crossSizesConstants.rightEdge)*10 && x >= (this.crossSizesConstants.leftEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    }
                    else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
        }
        return 10 * letraLength;
    }
    
    
    
    /**
     * Funcion que posiciona las letras hacia la derecha.
     * 
     * @param {int} posx Posicion del eje de las X en la Web (columnas)
     * @param {int} posy Posicion del eje de las Y en la Web (fila)
     * @param {char} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetraDerecha(posx, posy, buffLetra, color, font) {
        let x, y;
        let letraLength;
        x = posx;
        y = posy;

        for (let i = 0; i < font[buffLetra].length; i++) {
            letraLength = font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x >= this.crossSizesConstants.leftEdge*10 && x < (this.cross_width-this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    }
                    else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
        }
        return 10 * letraLength;
    }
    
    
    /**
     * Funcion correspondiente a los efectos de las animaciones de IZQUIERDA Y DERECHA.
     * 
     * @param {string} texto Mensaje a mostrar.
     * @param {char} dir Indica la direccion del efecto, I (izquierda) y D (derecha).
     * @param {int} speed Velocidad de movimiento del texto.
     * @param {*} font Tipografia con la que representar el texto.
     * @param {int} pause Tiempo de espera que realizara el efecto.
     * @param {boolean} all_movement Indica si el texto realiza todo el movimiento.
     * @param {boolean} stop_middle Indica si hay pausa en el muestreo.
     * @param {int} offset Separacion del inicio del texto respecto al centro del panel a fin de que el 
     *            mensaje salga centrado
     * @param {*} color color en que mostrar el texto en caso de que la cruz lo permita.
     * 
     * done => indica si se ha realizado la pausa o si es necesaria.
     */
    _ponerTexto(texto, dir, speed, font, pause, all_movement, stop_middle, offset, color) {
        clearInterval(this.scrollControl);
        this.pos = this.col;

        //CASO HACIA DERECHA
        if (dir == "D") {
            for (let i = (this.row/10-this.crossSizesConstants.topEdge-this.crossSizesConstants.topPanel_Y); i < (this.row/10-this.crossSizesConstants.topEdge-this.crossSizesConstants.topPanel_Y) + font[texto[0]].length; i++) {
                if (this.col > this.crossSizesConstants.leftEdge*10) {
                    this.ctx.drawImage(this.bmpApagado, (this.col - 10), (this.crossSizesConstants.topEdge + this.crossSizesConstants.topPanel_Y + i)*10);
                }
            }
            //Miramos si hay espera
            if (pause > 0 && this.pos >= ((this.cross_width-offset)/2)*10 && !this.done) {
            for (let iletra = 0; iletra < texto.length; iletra++) {
                this.pos += this._ponLetraDerecha(this.pos, this.row, texto[iletra], color, font);
            }
            //Realizamos espera indicada
            if (this.contar == 0) {
                this.timeoutId = setTimeout(() => {
                    this.done = true;
                    if (stop_middle == true) {
                        this.acabar++;
                    }
                }, pause*1000);
            }
            this.contar++;

        } else {
            //Mientras no haya espera mostramos y desplazamos las letras
            if (stop_middle == true && pause == 0 && this.pos > ((this.cross_width-offset)/2)*10 ) {
                this.acabar++;
            }
            for (let iletra = 0; iletra < texto.length; iletra++) {
                this.pos += this._ponLetraDerecha(this.pos, this.row, texto[iletra], color, font);
            }
            this.col += 10; //Vamos incrementando las columnas
            if (this.pos >= (this.crossSizesConstants.leftEdge + this.crossSizesConstants.middlePanel_X + offset)*10) {
                this.acabar++;
            } 
        }

        //CASO HACIA LA IZQUIERDA
        } else if (dir == "I") {
            //Miramos si hay espera
            if (pause > 0 && this.pos <= ((this.cross_width-offset)/2+1)*10 && !this.done) {
                for (let iletra = 0; iletra < texto.length; iletra++) {
                    this.pos += this._ponLetraIzquierda(this.pos, this.row, texto[iletra], color, font);
                }
                //Realizamos espera indicada
                if (this.contar == 0) {
                    this.timeoutId = setTimeout(() => {
                        this.done = true;
                        if (stop_middle == true) {
                            this.acabar++;
                        }
                    }, pause*1000);
                }
                this.contar++;

            } else {
                //Mientras no haya espera mostramos y desplazamos las letras
                if (stop_middle == true && pause == 0 && this.pos <= ((this.cross_width-offset)/2)*10) {
                    this.acabar++;
                }
                for (let iletra = 0; iletra < texto.length; iletra++) {
                    this.pos += this._ponLetraIzquierda(this.pos, this.row, texto[iletra], color, font);
                }
                this.col -= 10; //Vamos incrementando las columnas
                if (this.col < (this.crossSizesConstants.leftEdge - offset) * 10) {
                    this.acabar++;
                }
            }
        }

        //Si se indica, finalizamos
        if (this.acabar > 0) {
            this.acabar = 0;
            this.contar = 0;
            this.fin = true;
            this.done = false;
        }

        if (this.fin == false) {
            this.scrollControl = setInterval(() => this._ponerTexto(texto, dir, speed, font, pause, all_movement, stop_middle, offset, color), this.tiempoScroll-(speed*2));
        }
    }
    
    
    //==================================================================================================================================================================================================================================================================
    
    
    /**
     * Funcion que posiciona el texto a partir de un punto fijo
     * 
     * @param {*} posx Posicion del eje de las X en la Web (columnas)
     * @param {*} posy Posicion del eje de las Y en la Web (fila)
     * @param {*} buffLetra Letra del mensaje a mostrar
     * @param {*} color Color en que mostrar la letra
     * @param {*} font Estilo tipografico del mensaje
     * @returns Posicion en el eje de las X de la Web despues de escribir la letra
     */
    _ponLetra(posx, posy, buffLetra, color, font) {
        let x, y;
        let letraLength;
        x = posx;
        y = posy;
        
        for (let i = 0; i < font[buffLetra].length; i++) {
            letraLength = font[buffLetra][i].length;
            for (let j = 0; j < letraLength; j++) {
                if (x > this.crossSizesConstants.leftEdge*10 && x < (this.cross_width - this.crossSizesConstants.rightEdge)*10) {
                    if (font[buffLetra][i][j] != 0) {
                        this.ctx.drawImage(color, x, y);
                    }
                    else {
                        this.ctx.drawImage(this.bmpApagado, x, y);
                    }
                }
                x += 10;
            }
            x = posx;
            y += 10;
        }
        return 10 * letraLength;
    }
    
    
    /**
     * Funcion correspondiente a los efectos de las animaciones de FIJO Y FIJO PARPADEANTE.
     * 
     * @param {string} texto Mensaje a mostrar.
     * @param {char} dir Indica la direccion del efecto, I (izquierda) y D (derecha).
     * @param {*} font Tipografia con la que representar el texto.
     * @param {int} speed Velocidad de movimiento del texto.
     * @param {int} pause Tiempo de espera que realizara el efecto.
     * @param {*} color Color en que mostrar el texto en caso de que la cruz lo permita.
     * 
     * done => indica si se ha realizado el tiempo entre mostrar y apagar mensaje.
     * contar => numero de veces que hay que realizar el encendido y apagado
     */
    _ponerTextoStatico(texto, dir, font, speed, pause, color) {
      
        this.pos = this.col;
        clearInterval(this.scrollControl);
    
        //CASO FIJO
        if (dir == "F") {
            //Mostramos mensaje
            for (let iletra = 0; iletra < texto.length; iletra++) {
                this.pos += this._ponLetra(this.pos, this.row, texto[iletra], color, font);
            }
            //Realizamos espera indicada
            if (this.done == false) {
                setTimeout(() => {
                    this.acabar++;
                }, pause*1000);
                this.done = true;
            }
        
        //CASO FIJO PARPADEANTE
        } else if (dir == "FP") {
        
            //Mostramos mensaje
            if (this.contar % 2 == 0) {
        
            if (this.done == false) {
                for (let iletra = 0; iletra < texto.length; iletra++) {
                    this.pos += this._ponLetra(this.pos, this.row, texto[iletra], color, font);
                }
        
                clearTimeout(this.timeoutId);
                
                //Tiempo de espera entre encendido y apagado
                this.done = true;
                this.timeoutId = setTimeout(() => { 
                    this.contar++;
                    this.done = false;
                }, 800);
            }
        
            } else {
            //Escondemos el mensaje
            if (this.done == false) {
                for (let iletra = 0; iletra < texto.length; iletra++) {
                    this.pos += this._ponLetra(this.pos, this.row, texto[iletra], this.bmpApagado, font);
                }
        
                clearTimeout(this.timeoutId);
        
                //Tiempo de espera entre encendido y apagado
                this.done = true;
                this.timeoutId = setTimeout(() => {
                    this.contar++;
                    this.done = false;
                }, 800);
            }
            }
        
            //Numero de ciclos de apagado y encendido
            if (this.contar > 4) {
                this.acabar++;
            }
        
        }
        
        //Si se indica, finalizamos
        if (this.acabar > 0) {
            this.acabar = 0;
            this.contar = 0;
            this.fin = true;
            this.done = false;
            clearTimeout(this.timeoutId); //Eliminamos cualquier ejecucion posterior para evitar problemas
        }
        
        if (this.fin == false) {
            this.scrollControl = setInterval(() => this._ponerTextoStatico(texto, dir, font, speed, pause, color), this.tiempoScroll-(speed*2));
        }
    }

    _calculateLedPosition(action:Action){
        const height = this.productModel.central_panel.height;

        var table = [];
        var totalRows = 0;
        for (const [key, font] of Object.entries(environment.FONTSIZE)) {
            let rows = Math.floor(height / font);
            var divisions = Math.floor(height / font);
            var rest = Math.floor((height - (divisions * font))/2);
            
            var col = [];
            var ledPosition = 0 + rest;
            for(let i = 1; i <= rows; i++){
                var rowNum = totalRows + i;
                var ledFi = Math.floor((ledPosition + font) - 1);
                col.push({rowId: rowNum, led: ledPosition, ledFi: ledFi});

                ledPosition = Math.floor(ledPosition + font);
            }
            if(col.length > 0) table.push(col);
            
            totalRows = totalRows + rows;
        }

        for(let column of table){            
            for(let [index, tableRow] of column.entries()){
                if(tableRow.rowId == action.parameters.row){
                    var range = { ledInit: tableRow.led, ledFi: tableRow.ledFi}
                    let space = range.ledFi - range.ledInit + 1;
                    return tableRow.led + Math.floor((space - environment.FONTSIZE[action.parameters.font_size]) / 2);
                }
            }
        }
    }

    //==================================================================================================================================================================================================================================================================
  


    /**
     * Funcion para obtener la constant dib del fichero dib.ts
     * 
     * @param {dib} dib parametros a recuperar a recuperar
     */
    _getDib(dib) {
        switch(dib) {
            case 'dib0':
                return dib0;
            case 'dib1':
                return dib1;
            case 'dib2':
                return dib2;
            case 'dib3':
                return dib3;
            case 'dib4':
                return dib4;
            case 'dib5':
                return dib5;
            case 'dib6':
                return dib6;
            case 'dib7':
                return dib7;
            case 'dib8':
                return dib8;
            case 'dib8':
                return dib9;
            case 'dib10':
                return dib10;
            
            case 'dib11':
                return dib11;
            case 'dib12':
                return dib12;
            case 'dib13':
                return dib13;
            case 'dib14':
                return dib14;
            case 'dib15':
                return dib15;
            case 'dib16':
                return dib16;
            case 'dib17':
                return dib17;
            case 'dib18':
                return dib18;
            case 'dib19':
                return dib19;
            case 'dib20':
                return dib20;
            case 'dib21':
                return dib21;
            case 'dib22':
                return dib22;
            case 'dib23':
                return dib23;
            case 'dib24':
                return dib24;
            case 'dib25':
                return dib25;
            case 'dib26':
                return dib26;
        
            case 'privdib00':
                return privdib00;  
        
            case 'privdib01':
                return privdib01; 
    
            case 'privdib02':
                return privdib02; 

            case 'privdib03':
                return privdib03;
            default:
                return undefined;
        }
    }
}
