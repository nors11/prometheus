import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { Sequence } from '../../models/sequence';
import { ProviderService } from '../../services/provider.service';
import { SequenceService } from '../../services/sequence.service';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProductModel } from '../../../product-models/models/product-model';
import { ProductModelService } from '../../../product-models/services/product-model.service';
import { CrossService } from '../../services/cross.service';
import { Cross } from '../../models/cross';
import { SequenceHelper } from '../../helpers/sequence.helper';
import { ImageService } from '../../../../services/image.service';
import { environment } from 'src/environments/environment.prod';
import { Type, TypeAbbreviationPipe } from '../../models/service';
import { AppConfig } from 'src/app/app.config';

export class AvailableRow{
    id: number;
    name: string;
}
@Component({
    selector: 'tecneplas-actions',
    templateUrl: '../../views/actions/actions.component.html'
})
export class ActionsComponent implements OnInit {

    @ViewChild('deleteSequenceModal', { static: false }) private deleteSequenceModal;
    @ViewChild('showRowsModal', { static: false }) private showRowsModal;
    public calendar;
    public weekly;
    public location;
    public currentAccount;
    public crossId: string;
    public sequenceId: string;
    public sequence: Sequence;
    public actionForm: UntypedFormGroup;
    public actionFormValue: any;
    public actionTypes = [];
    public drawingsList: string[];
    public effectsList: string[];
    public fontSizesList: string[];
    public rowsList: string[];
    public speedsList: string[];
    public pausesList: string[];
    public animationsList: string[];
    public colorList: string[];
    public modalRef: NgbModalRef;
    public modalRef2: NgbModalRef;
    public sequenceForm: UntypedFormGroup;
    public categories: string[];
    public filePath;
    public file;
    public filePaths = [];
    public files = [];
    public shortLink;
    public index: number;
    public actions = [];
    public sequenceCategory = '';
    public productModel: ProductModel;
    public sequences: Sequence[];
    public blob;
    public type = Type;
    public modelAttributes: Object;
    public availableRows: AvailableRow[] = [];
    public allRows: number;
    public numFontSizes;
    public helpTable = [];
    public noActions;
    public dbSequence: Sequence;
    @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
    
    public FUENTE = {
        "PEQUEÑA": 1,
        "NORMAL": 2,
        "GRANDE": 3,
        "MUYGRANDE": 4,
    };

    public FILA = {
        "FILA1": 1,
        "FILA2": 2,
        "FILA3": 3,
    };

    constructor(
        private authenticationService: AuthenticationService,
        private activatedRoute: ActivatedRoute,
        private sequenceService: SequenceService,
        private modalService: NgbModal,
        private formBuilder: UntypedFormBuilder,
        private providerService: ProviderService,
        private toastService: ToastService,
        private router: Router,
        private productModelService: ProductModelService,
        private crossService: CrossService,
        private SequenceHelper: SequenceHelper,
        private imageService: ImageService,
        private actionTypePipe: TypeAbbreviationPipe
    ) { }

    ngOnInit(): void {
        this.filePaths = [];
        this.currentAccount = this.authenticationService.currentAccountValue;
        this.sequenceForm = this.formBuilder.group({
            _id: [''],
            id_cross: [''],
            name: [''],
            category: [''],
            actions: this.formBuilder.array([])
        });

        // Get id_cross param
        this.activatedRoute.parent.params.subscribe((params) => {
            this.crossId = params.id_cross;
            this.crossService.view(this.crossId).subscribe((cross: Cross)=> {
                this.productModelService.viewByCross(cross.model).subscribe((productModel: ProductModel)=>{
                    this.productModel = productModel;
                    // Get action types for the sequences
                    this.sequenceService.indexActionTypesList(this.crossId).subscribe((actionTypes: string[]) => {
                        this.actionTypes = actionTypes;
                        // Get id_sequence params
                        this.activatedRoute.params.subscribe((params) => {
                            this.sequenceId = params.id_sequence;

                            // Get data of sequence
                            this.sequenceService.view(this.sequenceId).subscribe((sequence: Sequence) => {
                                this.sequence = sequence;
                                this.dbSequence = sequence;
                                if (sequence.default) {
                                    this.sequenceForm.controls.category.disable();
                                }
                                this.sequenceCategory = sequence.category;

                                // Setting values for sequence form
                                this.sequenceForm.get('_id').setValue(this.sequenceId);
                                this.sequenceForm.get('id_cross').setValue(this.crossId);
                                this.sequenceForm.get('name').setValue(this.sequence.name);
                                this.sequenceForm.get('category').setValue(this.sequence.category);

                                // Add actions to the form element
                                if (sequence.actions.length > 0) {
                                    const actions = this.sequenceForm.get('actions') as UntypedFormArray;
                                    for (const [index, action] of sequence.actions.entries()) {
                                        let fieldsGroup = {};
                                        for (const field in action) {
                                            if (typeof action[field] !== 'object') {
                                                fieldsGroup[field] = action[field];
                                            }
                                            else {
                                                let paramsGroup = new UntypedFormGroup({});
                                                for (let param in action[field]) {
                                                    paramsGroup.addControl(param, new UntypedFormControl(action[field][param]));
                                                }
                                                fieldsGroup[field] = paramsGroup;
                                            }
                                        }

                                        actions.push(this.formBuilder.group(fieldsGroup));
                                        this.actions.push(action);
                                        if(action.type == 'image') this.filePaths.push({index: index, filePath: action.parameters.path});
                                    }
                                }
                            });
                        });
                    });
                    this.productModelService.getModelActionOptions(this.productModel._id).subscribe((modelAttributes: Object)=>{
                        this.modelAttributes = modelAttributes;
                    })
                });
            });
            this.sequenceService.indexGroupedByCategory(this.crossId).subscribe((sequences: Sequence[]) => {
                this.sequences = sequences;
            });
        });        

        // Get categories for the sequences
        this.sequenceService.indexCategoriesList().subscribe((categories: string[]) => {
            this.categories = categories;
            this.sequenceForm.patchValue({ category: this.categories[0]['id'] });
        });
    }
    async onChange(event) {
        if (event.target.files && event.target.files[0]) {
            if(this.imageService.checkFormat(event.target.files[0])){
                var result = await this.imageService.readImage(event.target.files[0]);
                this.filePath = result.path;
                var existingFilePath = this.getImageAtIndex(this.index)
                if(existingFilePath){
                    existingFilePath.filePath = result.path;
                }
                else{
                    this.filePaths.push({index: this.index, filePath: result.path})
                }
                this.actions[this.index]['parameters']['path'] = this.filePath;
                this.file = {
                    index: this.index, file: result.file
                };
                var existingFile = this.getFileAtIndex(this.index);
                if(existingFile) {
                    existingFile.file = this.file;
                    existingFile.filePath = result.path;
                }
                else{
                    this.files.push({index: this.index, file: this.file, filePath: result.path});
                }
            }
        }
    }

    getImageAtIndex(index){
        var existingFilePath = this.filePaths.find(file => file.index == index);
        return existingFilePath;
    }

    getFileAtIndex(index){
        var existingFile = this.files.find(file => file.index == index);
        return existingFile;
    }

    openAddActionModal(addActionModal) {
        const actions = this.sequenceForm.get('actions') as UntypedFormArray;
        this.actionForm = this.formBuilder.group({
            type: ['', Validators.required],
        });
        this.modalRef = this.modalService.open(addActionModal, { ariaLabelledBy: 'modal-basic-title' });
    }

    openEditActionModal(editActionModal, i) {
        this.index = i;

        const actions = this.sequenceForm.get('actions') as UntypedFormArray;
        this.actionForm = actions.at(i) as UntypedFormGroup;
        this.actionFormValue = this.actionForm.value;

        if(this.actionForm.controls['parameters']['controls']['message']) this.actionForm.controls['parameters']['controls']['message'].setValidators([Validators.required, Validators.maxLength(1024)]);

        if(this.actionForm.controls['parameters']['controls']['font_size']) {
            this.calculateRowsAvailable();
        }
        this.modalRef = this.modalService.open(editActionModal, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
    }

    calculateRowsAvailable(){
        this.helpTable = [];
        this.availableRows = [];
        const height = this.productModel.central_panel.height;
        var removeIndex = [];
        this.numFontSizes = 0;
        for(const [i, size]  of this.modelAttributes[this.actionForm.get('type').value]['font_size'].entries()){
            if(environment.FONTSIZE[size.id] > height){
                removeIndex.push(i);
            }
            else{
                this.numFontSizes = this.numFontSizes + 1;
            }
        }
        
        this.modelAttributes[this.actionForm.get('type').value]['font_size'] = 
        this.modelAttributes[this.actionForm.get('type').value]['font_size'].filter((item, index) => !removeIndex.includes(index));
        
        var fontSizeId = this.modelAttributes[this.actionForm.get('type').value]['font_size'][0].id;
        if(this.actionForm.controls['parameters']['controls']['font_size'].value && this.actionForm.controls['parameters']['controls']['font_size'].value <= this.numFontSizes){
            fontSizeId = parseInt(this.actionForm.controls['parameters']['controls']['font_size'].value);
        }
        
        let fontLedSize = environment.FONTSIZE[fontSizeId];
        this.actionForm.get('parameters').get('font_size').setValue(fontSizeId);
        this.allRows = 0;
        for (const [key, font] of Object.entries(environment.FONTSIZE)) {
            let rowsPerFont = Math.floor(height / font);
            var col = [];
            for(let i = 1; i <= rowsPerFont; i++){
                col.push(this.allRows + i);
                if(fontLedSize <= font){
                    var id: number = this.allRows + i;
                    var availableRow = new AvailableRow();
                    availableRow.id = id;
                    availableRow.name = 'Fila ' + (this.allRows + i);
                    this.availableRows.push(availableRow);
                }
            }
            if(col.length > 0) this.helpTable.push(col)
            
            this.allRows = this.allRows + rowsPerFont;
        }
        if(this.actionForm.controls['parameters']['controls']['row'] && !this.availableRows.find(row=> row.id == this.actionForm.controls['parameters']['controls']['row'].value)){
            this.actionForm.get('parameters').get('row').setValue(this.availableRows[0].id);
        }
        else if (this.actionForm.controls['parameters']['controls']['row'] && this.availableRows.find(row=> row.id == this.actionForm.controls['parameters']['controls']['row'].value)){
            this.actionForm.get('parameters').get('row').setValue(parseInt(this.actionForm.get('parameters').get('row').value));
        }
    }

    closeEditActionModal() {
        this.modalRef.dismiss();
        const actions = this.sequenceForm.get('actions') as UntypedFormArray;
        this.actionForm.reset(this.actionFormValue);
    }

    pushActionToFormSequence() {
        const actions = this.sequenceForm.get('actions') as UntypedFormArray;
        const type = this.actionForm.get('type').value;
        const actionType = this.actionTypes.find((actionType) => actionType['id'] === type.id);
        // Assign attributes of parameters to actionForm
        let paramsGroup = new UntypedFormGroup({});
        for (let param in actionType['parameters']) {
            if(param == 'row' || param == 'font_size' || param == 'path'){
                paramsGroup.addControl(param, new UntypedFormControl());
            }
            else{
                paramsGroup.addControl(param, new UntypedFormControl(actionType['parameters'][param]));
            }
        }
        
        this.actionForm.addControl('parameters', paramsGroup);
        this.actionForm.get('type').setValue(this.actionForm.get('type').value.id);
        
        if(this.actionForm.get('parameters').get('font_size')) this.calculateRowsAvailable();
        actions.push(this.actionForm);
        this.actions.push(this.actionForm.value);
        this.modalRef.dismiss();
    }

    async submitFormSequence() {
        var sequence = this.sequenceForm.value;
        for(let action of sequence.actions){
            if(action.parameters['font_size']) action.parameters['led'] = this.calculateLedPosition(action.parameters.row, action.parameters.font_size, this.productModel);
        }
        var nameExists = this.checkDuplicates(sequence);
        if(nameExists){
            this.toastService.show('El nom de seqüència està repetit', { classname: 'bg-danger text-white' });
        }else{
            if (this.files.length > 0) {
                for(let file of this.files){
                    var path = await this.imageService.uploadImage(file.file.file).toPromise();
                    file.filePath = environment.backendUrlPath + path;
                    sequence.actions[file.index].parameters.path = file.filePath;
                }
            }

            this.sequenceService.patch(this.sequenceId, sequence).subscribe((sequence: Sequence) => {
                this.dbSequence = sequence;
                this.toastService.show('Secuencia actualizada correctamente.', { classname: 'bg-success text-white' });
            },
            (error) => {
                this.toastService.show('Error actualizando la secuencia.', { classname: 'bg-danger text-white' });
            });
        }
    }

    submitFormAction() {
        if(this.actionForm.valid) {
            let action = this.actionForm.controls['parameters'].value;
            let type = this.actionForm.controls['type'].value;
            if(type == 'animation' && !action.path) action.path = '';
            Object.keys(action).forEach(key => {
                if (typeof action[key] == 'string' && !isNaN(action[key])) {
                    action[key] = parseInt(action[key]);
                }
                if(key == 'path' && type == 'animation'){
                    let attribute = this.modelAttributes['animation']['animation'].find(animation => animation.id == action['animation']);
                    let path = attribute.path;
                    if(path) action[key] = environment.backendUrlPath + path;
                }
            });

            this.modalRef.dismiss();
        }    
    }

    getActionTypeName(actionId) {
        const action = this.actionTypes.find((action) => action['id'] === actionId);
        if(action) return action['name'];
    }

    getActionControls() {
        const actions = this.sequenceForm.get('actions') as UntypedFormArray;
        return actions?.controls;
    }

    deleteAction(i) {
        var actions = this.sequenceForm.get('actions') as UntypedFormArray;
        actions.removeAt(i);
    }

    duplicateAction(i) {
        this.actionForm = this.formBuilder.group({
            type: ['', Validators.required],
        });
        const actions = this.sequenceForm.get('actions') as UntypedFormArray;
        var action = actions.value[i];
        
        const type = action.type;
        this.actionForm = this.formBuilder.group({
            type: [type, Validators.required],
        });

        // Assign attributes of parameters to actionForm
        let paramsGroup = new UntypedFormGroup({});
        for(let param in action.parameters){
            paramsGroup.addControl(param, new UntypedFormControl(action.parameters[param]));
        }
        this.actionForm.addControl('parameters', paramsGroup);

        // Push new action to the actions of sequences
        actions.push(this.actionForm);
        this.actions.push(this.actionForm.value);
    }

    drop(event: CdkDragDrop<string[]>) {
        for(let filePath of this.filePaths){
            if(filePath.index == event.previousIndex){
                var existingFilePath = this.getImageAtIndex(event.previousIndex);
                if(existingFilePath) existingFilePath.index = event.currentIndex;
            }
            else{
                if(event.currentIndex > event.previousIndex){
                    if(filePath.index > event.previousIndex && filePath.index <= event.currentIndex){
                        filePath.index = filePath.index - 1;
                    }
                }
                else if(event.currentIndex < event.previousIndex){
                    if(filePath.index < event.previousIndex && filePath.index >= event.currentIndex){
                        filePath.index = filePath.index + 1;
                    }
                }
            }
        }
        for(let file of this.files){
            if(file.index == event.previousIndex){
                var existingFile = this.getFileAtIndex(event.previousIndex);
                if(existingFile) {
                    existingFile.index = event.currentIndex;
                    existingFile.file.index = event.currentIndex;
                }
            }
            else{
                if(event.currentIndex > event.previousIndex){
                    if(file.index > event.previousIndex && file.index <= event.currentIndex){
                        file.index = file.index - 1;
                        file.file.index = file.file.index - 1;
                    }
                }
                else if(event.currentIndex < event.previousIndex){
                    if(file.index < event.previousIndex && file.index >= event.currentIndex){
                        file.index = file.index + 1;
                        file.file.index = file.file.index + 1;
                    }
                }
            }
        }
        
        moveItemInArray(this.sequenceForm.get('actions')['controls'], event.previousIndex, event.currentIndex);
        this.sequenceForm.setControl('actions', this.formBuilder.array(this.sequenceForm.get('actions')['controls']));
    }
    toggleRadio(e) {
        if (e.target.id == 'formTextOnlyIn') {
            if (e.target.checked == true) {
                this.actionForm.controls['parameters'].get('text_in_out').setValue(false);
            }
        }
        if (e.target.id == 'formTextInOut') {
            if (e.target.checked == true) {
                this.actionForm.controls['parameters'].get('text_only_in').setValue(false);
            }
        }
    }

    duplicateSequence() {
        let newSequence = JSON.parse(JSON.stringify(this.sequence));
        delete newSequence._id;
        delete newSequence.default;
        newSequence.name = newSequence.name + ' (copia)';
        newSequence.name = this.SequenceHelper.checkDuplicateSequence(this.sequences, this.sequence, newSequence.name);

        this.sequenceService.create(newSequence).subscribe((sequence: Sequence) => {
            this.toastService.show('Secuencia creada correctamente.', { classname: 'bg-success text-white' });
        },
        (error) => {
            this.toastService.show('Error creando la secuencia', { classname: 'bg-danger text-white' });
        });
    }

    async deleteSequence(noActions?) {
        var result = await this.SequenceHelper.deleteSequence(this.sequence, this.crossId);
        if(result){
            this.calendar = result.calendar;
            this.location = result.location;
            this.weekly = result.weekly;
            if(noActions){
                this.acceptDeleteSequence(this.sequence, noActions)
            }
            else{
                this.modalRef = this.modalService.open(this.deleteSequenceModal, { ariaLabelledBy: 'modal-basic-title' });
            }
        }
    }
    
    async acceptDeleteSequence(sequence, noActions?){
        if(this.modalRef) this.modalRef.close();
        this.SequenceHelper.acceptDeleteSequence(sequence, this.crossId, this.calendar, this.weekly, noActions).then((res)=>{
            this.sequences = res;
            this.location = null;
            this.calendar = null;
            this.weekly = null;
            this.router.navigate(['cross/', this.crossId]);
        })
    }
    
    checkDuplicates(newSequence){
        for(let sequence of this.sequences){
            if(sequence.category == newSequence.category){
                if(sequence['list'].find(seq => seq.name === newSequence.name && seq._id.toString() != newSequence._id.toString())){
                    return true;                
                }
            }
        }
        return false;
    }

    goBack(){
        if(this.dbSequence.actions.length <= 0) {
            this.deleteSequence(true);
        }
        else{
            this.router.navigate(['cross/', this.crossId]);
        }
    }

    findOption(action, option, id){
        if(this.modelAttributes && this.modelAttributes[action] && this.modelAttributes[action][option]){
            if(option == 'row'){
                return 'Fila ' + id;
            }
            else{
                var option = this.modelAttributes[action][option].find(opt => opt['id'] == id);
                if(option )return option['name'];
            }
        }
    }

    preventAccordion(index, type?){
        if(!type || (type && this.checkActionAvailability(type))){
            const elem = document.getElementById('accordion_'+index);
            elem.setAttribute('data-bs-toggle', '');
        }
    }

    activeAccordion(index){
        const elem = document.getElementById('accordion_'+index);
        elem.setAttribute('data-bs-toggle', 'collapse');
    }

    optionAvailable(option){
        return this.modelAttributes[this.actionForm.get('type').value]['other'].find(opt => opt.id === option)
    }

    async showHelpModal(){
        this.modalRef2 = this.modalService.open(this.showRowsModal, { ariaLabelledBy: 'modal-basic-title' });
    }

    checkActionAvailability(type){
        if(this.modelAttributes[type]) return false;
        else return true;
    }
    
    openSequenceSimulatorModal(sequenceSimulatorModal){
        this.modalRef2 = this.modalService.open(sequenceSimulatorModal, { ariaLabelledBy: 'modal-basic-title', size:'lg' });
    }

    calculateLedPosition(row, fontSize, model){
        const height = model.central_panel.height;

        var table = [];
        var totalRows = 0;
        for (const [key, font] of Object.entries(AppConfig.FONTSIZE)) {
            let rows = Math.floor(height / font);
            var divisions = Math.floor(height / font);
            var rest = Math.floor((height - (divisions * font))/2);
            
            var col = [];
            var ledPosition = 1 + rest;
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
                if(tableRow.rowId == row){
                    var range = { ledInit: tableRow.led, ledFi: tableRow.ledFi}
                    let space = range.ledFi - range.ledInit + 1;
                    return tableRow.led + Math.floor((space - AppConfig.FONTSIZE[fontSize]) / 2);
                }
            }
        }
    }
}
