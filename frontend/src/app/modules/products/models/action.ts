export class Action {

        public _id: string;
        public type: string;
        public parameters: {
            message: string,
            top_drawing: number,
            bottom_drawing: number,
            effect: number,
            delete_single_row: boolean,
            delete_all: boolean,
            text_in_out: boolean,
            text_only_in: boolean,
            font_size: number,
            row: number,
            speed: number,
            pause: number,
            img: string,
            orla: boolean,
            path: string,
            led: number,
            font_family: number,
            color: number
        };
    
        constructor() {
        }
    
        public get(field): any {
            return this[field];
        }
    
        public set(field, value) {
            this[field] = value;
        }
    }
    