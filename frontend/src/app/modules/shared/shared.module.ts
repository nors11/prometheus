import { NgModule } from '@angular/core';
import { TypeAbbreviationPipe } from '../products/models/service';
import { SequenceSimulatorComponent } from '../../components/sequence-simulator.component';

@NgModule({
    imports: [ ],
    declarations: [ 
        TypeAbbreviationPipe,
        SequenceSimulatorComponent
    ],
    exports: [ 
        TypeAbbreviationPipe,
        SequenceSimulatorComponent
    ],
    providers:[ TypeAbbreviationPipe ]
})
export class SharedModule { }