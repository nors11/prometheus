import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, UntypedFormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Service, Type } from 'src/app/modules/products/models/service';
import { ServiceService } from 'src/app/modules/products/services/service.services';
import { ProviderService } from 'src/app/modules/products/services/provider.service';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ProductModel } from '../../models/product-model';
import { ProductModelService } from '../../services/product-model.service';
import { ModelAttributeService } from '../../services/model-attribute.service';
import { ModelSequenceService } from '../../services/model-sequence.service';
import { ToastService } from 'src/app/services/toast.service';
import { ModelAttribute, AttributeOption } from '../../models/model-attribute';
import { ModelSequence } from '../../models/model-sequence';
import { SequenceService } from 'src/app/modules/products/services/sequence.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment.prod';
import { ImageService } from '../../../../services/image.service';
import { AppConfig } from '../../../../app.config';

@Component({
    selector: 'tecneplas-new-model',
    templateUrl: '../../views/product-models/new-product-models.component.html',
})
export class NewProductModelComponent implements OnInit {

    public modelId: string;
    public currentWizardNumber: number = 0;
    public currentContractType:string;
    public modelForm: UntypedFormGroup;
    public modelSingleAttributeFormValues: UntypedFormGroup;
    public modelAttributesForm: UntypedFormArray;
    public modelSequencesForm: UntypedFormArray;
    public modelSingleSequenceForm: UntypedFormGroup;
    public modelSingleSequenceFormValues: UntypedFormGroup;
    public actionForm: UntypedFormGroup;
    public actionFormValue: UntypedFormGroup;
    public contractForm: UntypedFormGroup;
    public onlineServiceForm: UntypedFormGroup;
    public services: Service[];
    public service: Service;
    public productModel: ProductModel;
    public type = Type;
    public debug:boolean = true;

    public pushServices = [];
    public messageError = [];
    public newCross;
    public showErrorsNewProduct = {};
    public showErrorsContract = {};
    public pharmacy = null;
    public productTypes = [];
    public fringes = [];
    public subscriptions: Subscription[] = [];
    public modalRef: NgbModalRef;
    public modalRef2: NgbModalRef;
    public modalRef3: NgbModalRef;
    public modelAttributes:ModelAttribute[] = [];
    public modelSequences: ModelSequence[] = [];
    public categories: string[];
    public sequencesCount = 0;
    public availableRows = [];
    public allRows: number;
    public helpTable = [];
    public index: number;
    @ViewChild('showRowsModal', { static: false }) private showRowsModal;
    @ViewChild('editModelSequenceModal', { static: false }) private editModelSequenceModal;

    constructor(
        private activatedRoute: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private serviceService: ServiceService,
        private providerService: ProviderService,
        private modalService: NgbModal,
        private productModelService: ProductModelService,
        private modelAttributeService: ModelAttributeService,
        private modelSequenceService: ModelSequenceService,
        private sequenceService: SequenceService,
        private toastService: ToastService,
        private imageService: ImageService
    ) { }

    ngOnInit(): void {
        // Model Form
        this.modelForm = this.formBuilder.group({
            name: ['', Validators.required],
            type: ['', Validators.required],
            fringe: [''],
            sources: ['', Validators.required],
            masks: [[]],
            top_panel: this.formBuilder.group({
                width: ['',  [ Validators.required, Validators.pattern('^\\d+$') ]],
                height: ['', [ Validators.required, Validators.pattern('^\\d+$') ]]
            }),
            central_panel: this.formBuilder.group({
                width: ['',  [ Validators.required, Validators.pattern('^\\d+$'), Validators.min(1) ]],
                height: ['', [ Validators.required, Validators.pattern('^\\d+$'), Validators.min(7) ]]
            }),
            bottom_panel: this.formBuilder.group({
                width: ['',  [ Validators.required, Validators.pattern('^\\d+$') ]],
                height: ['', [ Validators.required, Validators.pattern('^\\d+$') ]]
            }),
            bicolor: [false],
            online_services: this.formBuilder.array([]),
            offline_services: this.formBuilder.array([]),
            active: [true]
        });

        // Model Attributes Form
        this.modelAttributesForm = this.formBuilder.array([]);
        this.serviceService.index().subscribe((services:Service[]) => {
            this.services = services;
            if(this.debug) console.log('SERVICES');
            if(this.debug) console.log(this.services);
            if(this.debug) console.log('\n');

            if(this.modelId) return;

            const onlineServices: UntypedFormArray = this.modelForm.get('online_services') as UntypedFormArray;
            const offlineServices: UntypedFormArray = this.modelForm.get('offline_services') as UntypedFormArray;
            
            for(let service of this.services) {
                if(service.online) onlineServices.push(new UntypedFormControl(service._id)); 
                if(service.offline) offlineServices.push(new UntypedFormControl(service._id));
            }

            if(this.debug) console.log('MODEL ATTRIBUTES');
            if(this.debug) console.log(this.modelAttributesForm.value);
        });

        // Model Single Sequence Form
        this.modelSingleSequenceForm = this._createModelSingleSequenceForm();

        // Model Sequences Form
        this.modelSequencesForm = this.formBuilder.array([]);

        // Get type list
        this.subscriptions['indexProductTypesProviderService'] = this.providerService.indexProductTypes().subscribe((productTypes:[]) => {
            this.productTypes = productTypes
            this.modelForm.get('type').setValue(this.productTypes.find(productType => productType.id === 'cross').id);
        });
        // Get fringe list
        this.subscriptions['indexFringesProviderService'] = this.providerService.indexFringes().subscribe((fringes:[]) => {
            this.fringes = fringes
            this.modelForm.get('fringe').setValue(this.fringes.find(fringe => fringe.id === 'none').id);
        });
        // Get categories for the model-sequences
        this.subscriptions['indexCategoriesList'] = this.sequenceService.indexCategoriesList().subscribe((categories: string[]) => {
            this.categories = categories;
            this.modelSingleSequenceForm.patchValue({ category: this.categories[0]['id'] });
        });

        this.activatedRoute.params.subscribe((params) => {
            if(!params.id_model) return;

            this.modelId = params.id_model;

            this.subscriptions['viewByModelIdModelAttribute'] = this.modelAttributeService.viewByProductModelId(this.modelId).subscribe((modelAttributes:ModelAttribute[]) => {
                this.modelAttributes = modelAttributes;

                this.subscriptions['viewProductModel'] = this.productModelService.viewByCross(this.modelId).subscribe((productModel: ProductModel) => {
                    this.productModel = productModel;
                    if(this.productModel.type == 'sign'){
                        this.modelForm.get('top_panel').disable();
                        this.modelForm.get('bottom_panel').disable();
                    }
                    // Patch value to the modelForm
                    Object.keys(this.productModel).forEach(key => {
                        if(!['_id', 'online_services', 'offline_services', '__v'].includes(key)) {
                            this.modelForm.get(key).patchValue(this.productModel[key]);
                        }
                    });
    
                    const onlineServices: UntypedFormArray = this.modelForm.get('online_services') as UntypedFormArray;
                    const offlineServices: UntypedFormArray = this.modelForm.get('offline_services') as UntypedFormArray;
                
                    for(let service of this.productModel.online_services) {
                        onlineServices.push(new UntypedFormControl(service._id));
                    }
    
                    for(let service of this.productModel.offline_services) {
                        offlineServices.push(new UntypedFormControl(service._id));
                    }

                    if(this.debug) console.log('MODEL ATTRIBUTES');
                    if(this.debug) console.log(this.modelAttributesForm.value);
    
                    if(this.debug) console.log('\nMODEL FORM');
                    if(this.debug) console.log(this.modelForm.value);
                });
            });
        });
    }

    onProductTypeChange() {
        if(this.modelForm.get('type').value === 'sign') {
            this.modelForm.get('fringe').setValue('none')
            this.modelForm.get('top_panel').disable();
            this.modelForm.get('bottom_panel').disable();
        }
        else{
            this.modelForm.get('top_panel').enable();
            this.modelForm.get('bottom_panel').enable();
        }
    }

    onServiceCheckboxChange(serviceType:string, e) {
        const services: UntypedFormArray = this.modelForm.get(serviceType) as UntypedFormArray;
        const service = this.services.find(service => service._id === e.target.value)

        if (e.target.checked) {
            services.push(new UntypedFormControl(e.target.value));
            
            // Add service to modelAttributesForm
            this._createModelAttribute(service);
        } else {
            const index = services.controls.findIndex(x => x.value === e.target.value);
            services.removeAt(index);

            // Remove service from modelAttributesForm
            this._removeModelAttribute(service);
        }
    }

    isServiceChecked(serviceType:string, service) {
        const onlineServices: UntypedFormArray = this.modelForm.get(serviceType) as UntypedFormArray;
        const index = onlineServices.controls.findIndex(x => x.value === service._id);
        return (index >= 0) ? true : false;
    }

    toggleAttributeOptions(attributeType: string, event) {
        let modelAttributesForm = (this.getModelAttributeForm().get('attributes') as UntypedFormArray).controls.find((attribute) => attribute.value.type == attributeType);
        let availableOptions = modelAttributesForm.get('available_options') as UntypedFormArray;
        for(let option of availableOptions.controls) {
            option.get('checked').patchValue(event.target.checked);
        }
    }

    openEditService(editServiceModal, service:Service) {
        if(this.debug) console.log('\nSERVICE SELECTED: '+ service.name + ' - ' + service._id);
        this.modalRef = this.modalService.open(editServiceModal, { ariaLabelledBy: 'modal-basic-title', size:'xl' });
        this.modelSingleAttributeFormValues = { ...(this.modelAttributesForm.controls.find(modelAttributeControl => modelAttributeControl.value.id_service == service._id) as UntypedFormGroup).value };
        this.service = service;

        if(this.debug) console.log(this.modelSingleAttributeFormValues)
    }

    getModelAttributeForm() {
        return this.modelAttributesForm.controls.find(modelAttributeControl => modelAttributeControl.value.id_service == this.service._id) as UntypedFormGroup;
    }

    cancelEditService() {
        this.modalRef.dismiss();    
        const modelAttributesForm = this.modelAttributesForm.controls.find(modelAttribute => modelAttribute.value.id_service == this.service._id) as UntypedFormGroup;
        modelAttributesForm.setValue(this.modelSingleAttributeFormValues);
    }

    submitModelForm(){
        if(this.modelForm.valid){
            if(this.currentWizardNumber === 0){
                this.modelAttributesForm.clear();
                for(let service of this.services) {
                    this._createModelAttribute(service);
                }
            }
            if(this.currentWizardNumber === 1) {
                // Prepare modelAttributes array 
                this.modelAttributes = [];
                for(let service of this.modelAttributesForm.value) {                        
                    for(let attribute of service.attributes) {
                        let singleModelAttribute = new ModelAttribute();
                        singleModelAttribute.id_service = service.id_service;
                        singleModelAttribute.type_service = service.type;
                        singleModelAttribute.available_options = [];
                        singleModelAttribute.id_attribute = attribute.id_attribute
                        singleModelAttribute.type_attribute = attribute.type;

                        if(attribute.available_options){
                             for(let option of attribute.available_options) {
                                if(option.checked) {
                                    let attributeOption = new AttributeOption();
                                    attributeOption.id = (attribute.type === 'other') ? option.id : parseInt(option.id);
                                    attributeOption.name = option.name;
                                    if(option.path) attributeOption['path'] = option.path;
                                    singleModelAttribute.available_options.push(attributeOption);
                                }
                            }
                        }
                       

                        this.modelAttributes.push(singleModelAttribute);
                    }
                }

                // if(this.modelSequencesForm.value.length == 0){
                this._getDefaultSequences();
            }

            if(this.currentWizardNumber === 2) {
                if(this.debug) console.log('\nSAVING PRODUCT MODEL...');

                if(!this.modelId){
                    this._createProductModel();
                }
                else {
                    this._updateProductModel();
                }
            }

            this.currentWizardNumber = this.currentWizardNumber + 1;
        }
    }

    openAddModelSequenceModal(addModelSequenceModal, category?) {
        this.modelSingleSequenceForm = this._createModelSingleSequenceForm();
        this.modelSingleSequenceForm.get('_id').patchValue(uuidv4());
        this.modelSingleSequenceForm.get('category').patchValue((category) ? category : this.categories[0]['id']);
        this.modalRef = this.modalService.open(addModelSequenceModal, { ariaLabelledBy: 'modal-basic-title' });
    }

    openEditModelSequenceModal(editModelSequenceModal, sequence:any) {
        this.modelSingleSequenceForm = this._createModelSingleSequenceForm();
        this.modelSingleSequenceForm.patchValue({ _id:sequence._id, name:sequence.name, category: sequence.category, default:sequence.default });

        for(let action of sequence.actions) {
            let actionGroup = {};
            Object.keys(action).forEach(key => {
                if(Array.isArray(action[key])) {
                    actionGroup[key] = this.formBuilder.array([]);
                    for(let item of action[key]){
                        let paramsGroup = this.formBuilder.group({});
                        Object.keys(item).forEach(paramKey => {
                            paramsGroup.addControl(paramKey, new UntypedFormControl(item[paramKey]));
                        });
                        (actionGroup[key] as UntypedFormArray).push(paramsGroup);
                    }
                }
                else if(typeof action[key] == 'object') {
                    actionGroup[key] = this.formBuilder.group({})
                    Object.keys(action[key]).forEach(paramKey => {
                        actionGroup[key].addControl(paramKey, new UntypedFormControl(action[key][paramKey]));
                    });
                }
                else {
                    actionGroup[key] = new UntypedFormControl(action[key]);
                }
            });
            (this.modelSingleSequenceForm.get('actions') as UntypedFormArray).push(new UntypedFormGroup(actionGroup));   
        }

        this.modelSingleSequenceFormValues = { ...this.modelSingleSequenceForm.value };
        this.modalRef = this.modalService.open(editModelSequenceModal, { ariaLabelledBy: 'modal-basic-title', fullscreen:true });

        if(this.debug) console.log('\nEDIT SEQUENCE');
        if(this.debug) console.log(this.modelSingleSequenceForm.value);
        if(this.debug) console.log('\n');
    }

    openSequenceSimulatorModal(sequenceSimulatorModal){
        this.modalRef2 = this.modalService.open(sequenceSimulatorModal, { ariaLabelledBy: 'modal-basic-title', size:'lg' });
    }

    findAttributeName(serviceType:string, attributeType:string) {
        const availableAttributes = this.services.find((service) => service.name == serviceType).available_attributes;
        let attribute = availableAttributes.find((attribute) => attribute['type'] == attributeType);
        
        if(attribute) return attribute['name'];
        
        attribute = availableAttributes.find((attribute) => attribute['type'] == 'other');
        if(attribute) {
            const option = attribute['options'].find((option) => option.id == attributeType);
            return option.name;
        }
        return '';
    }

    findAttributeOptionName(serviceType:string, attributeType:string, attributeOptionValue:string) {
        if(typeof attributeOptionValue == 'boolean') return (attributeOptionValue) ? 'Sí' : 'No';

        const availableAttributes = this.services.find((service) => service.name == serviceType).available_attributes;
        const attribute = availableAttributes.find((attribute) => attribute['type'] == attributeType);
        if(attribute){
            if(attribute['type'] == 'text'){
                return attributeOptionValue;
            }
            const option = attribute['options'].find((option) => option.id == attributeOptionValue);
            if(option) return option.name;
        }
        
        return '';
    }

    submitModelSequenceForm(edit?:boolean) {
        this.modalRef.dismiss();
        
        if(!edit){
            if(this._checkDuplicates()){
                this.toastService.show('El nom de sequencia està repetit', { classname: 'bg-danger text-white' });
            }
            else{
            
                // Push new sequence to the specific category
                const modelSequenceCategoryForm = this.modelSequencesForm.controls.find((modelSequence) => modelSequence.value.category == this.modelSingleSequenceForm.get('category').value) as UntypedFormGroup;
                (modelSequenceCategoryForm.get('list') as UntypedFormArray).push(this.modelSingleSequenceForm);
                
                //open sequence modal
                this.openEditModelSequenceModal(this.editModelSequenceModal, this.modelSingleSequenceForm.value);
            }
        }    
        else {
            let modelSequenceCategoryForm = this.modelSequencesForm.controls.find((modelSequence) => modelSequence.value.category == this.modelSingleSequenceForm.get('category').value) as UntypedFormGroup;
            let modelSingleSequence = (modelSequenceCategoryForm.get('list') as UntypedFormArray).controls.find((modelSequence) => modelSequence.value._id == this.modelSingleSequenceForm.value._id) as UntypedFormGroup;

            (modelSingleSequence.get('actions') as UntypedFormArray).clear();
            for(let action of (this.modelSingleSequenceForm.get('actions') as UntypedFormArray).controls) {
                (modelSingleSequence.get('actions') as UntypedFormArray).push(action);
            }         
        }
    }

    openAddActionModal(addActionModal) {
        if(this.debug) console.log('ADD ACTION');
        if(this.debug) console.log(this.modelAttributesForm.value);

        const actions = this.modelSingleSequenceForm.get('actions') as UntypedFormArray;
        this.actionForm = this.formBuilder.group({
            type: ['', Validators.required],
        });

        this.modalRef2 = this.modalService.open(addActionModal, { ariaLabelledBy: 'modal-basic-title' });
    }

    openEditActionModal(editActionModal, i:number) {
        this.index = i;
        const actions = this.modelSingleSequenceForm.get('actions') as UntypedFormArray;
        this.actionForm = actions.at(i) as UntypedFormGroup;
        this.actionFormValue = { ...this.actionForm.value } as UntypedFormGroup;
        
        let availableAttributes = (this.modelAttributesForm.controls.find((attribute) => attribute.value.type == this.actionForm.value.type) as UntypedFormGroup).get('attributes') as UntypedFormArray;
        this.actionForm.addControl('available_attributes', availableAttributes);

        if(this.debug) console.log('\n ACTION SELECTED');
        if(this.debug) console.log(this.actionForm);
        
        if(this.debug) console.log('\n ATTRIBUTES AVAILABLES FOR THE ACTION: ' + this.actionForm.value.type);
        if(this.debug) console.log(availableAttributes.value);

        if(this.actionForm.get('parameters').get('font_size')) {
            this.calculateRowsAvailable();
        }

        if(this.debug) console.log(this.actionForm)

        this.modalRef2 = this.modalService.open(editActionModal, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });

    }

    calculateRowsAvailable(){
        this.helpTable = [];
        this.availableRows = [];
        const height = this.modelForm.get('central_panel').getRawValue().height;
        const service = this.modelAttributesForm.value.find((service) => service.type == this.actionForm.value.type);
        
        let fontSizeAttribute = (this.actionForm.get('available_attributes') as UntypedFormArray).controls.find((attribute) => attribute.value.type == 'font_size');
        let availableOptions = (fontSizeAttribute.get('available_options') as UntypedFormArray).controls.filter((option) => !option.value.checked || environment.FONTSIZE[option.value.id] > height);
        for(let option of availableOptions) {
            let index = (fontSizeAttribute.get('available_options') as UntypedFormArray).controls.indexOf(option);
            (fontSizeAttribute.get('available_options') as UntypedFormArray).removeAt(index);
        }
        
        let fontSizeId = service.attributes.find((attribute) => attribute.type === 'font_size').available_options[0].id;
        if(this.actionForm.get('parameters').value.font_size && (fontSizeAttribute.get('available_options') as UntypedFormArray).value.find((font) => font.id == this.actionForm.get('parameters').value.font_size)) {
            fontSizeId = this.actionForm.get('parameters').value.font_size
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
                    this.availableRows.push({id: this.allRows + i, name: 'Fila ' + (this.allRows + i)});
                }
            }
            if(col.length > 0) this.helpTable.push(col)
            
            this.allRows = this.allRows + rowsPerFont;
        }

        if(this.availableRows[0]) this.actionForm.get('parameters').get('row').setValue(this.availableRows[0].id);
    }

    cancelEditActionModal() {
        this.modalRef2.dismiss();
        const actions = this.modelSingleSequenceForm.get('actions') as UntypedFormArray;
        this.actionForm.patchValue({ parameters: this.actionFormValue['parameters'] });        
    }

    pushActionToFormSequence() {
        const actions = this.modelSingleSequenceForm.get('actions') as UntypedFormArray;
        const type = this.actionForm.get('type').value;
        const modelAttribute = this.modelAttributesForm.value.find((modelAttribute) => modelAttribute['type'] === type);

        // Assign attributes of parameters to actionForm
        let paramsGroup = new UntypedFormGroup({});
        for (let attribute of modelAttribute.attributes) {
            if(attribute.type !== 'img' && attribute.type !== 'message' && attribute.type !== 'path' && attribute.type !== 'row' && attribute.type !== 'font_size' && attribute.type !== 'other'){
                paramsGroup.addControl(attribute.type, new UntypedFormControl(attribute.available_options.find((option) => option.checked === true).id));
            }
            else if(attribute.type == 'other'){
                for(let opt of attribute.available_options){
                    if(opt.checked) {
                        paramsGroup.addControl(opt.id, new UntypedFormControl(true));
                    } 
                }
            }
            else{
                paramsGroup.addControl(attribute.type, new UntypedFormControl());
            }
        }
        this.actionForm.addControl('parameters', paramsGroup);

        if(this.debug) console.log('\nPUSH ACTION TO FORM SEQUENCE');
        if(this.debug) console.log(this.actionForm);

        // Push new action to the actions of sequences
        actions.push(this.actionForm);
        this.modalRef2.dismiss();
    }

    async onChangeImageFile(event) {
        if (event.target.files && event.target.files[0]) {

            if(this.imageService.checkFormat(event.target.files[0])){
                let result = await this.imageService.readImage(event.target.files[0]);
                
                // Upload image to the server
                let path = await this.imageService.uploadImage(result.file).toPromise();
                this.actionForm.get('parameters').get('img').setValue(AppConfig.backendUrlPath + '/' + path);
            }
        }
    }

    submitFormAction() {
        if(this.actionForm.valid) {            
            let action = this.actionForm.get('parameters').value;
            Object.keys(action).forEach(key => {
                if (typeof action[key] == 'string' && !isNaN(action[key])) {
                    action[key] = parseInt(action[key]);
                }
                if(key == 'path'){
                    let attribute = this.actionForm.get('available_attributes').value.find(att => att.type == 'animation');
                    let path = attribute.available_options.find(value => value.id == action['animation']).path;
                    action[key] = environment.backendUrlPath + path;
                }
            });

            this.modalRef2.dismiss();
        }        
    }

    deleteSequence(sequence, event?) {
        if(event) event.stopPropagation();
        const modelSequenceCategoryForm = this.modelSequencesForm.controls.find((modelSequence) => modelSequence.value.category == sequence.category) as UntypedFormGroup;
        const index = modelSequenceCategoryForm.get('list').value.findIndex(element => element._id == sequence._id);
        (modelSequenceCategoryForm.get('list') as UntypedFormArray).removeAt(index);
    }

    closeSequenceModal(){
        let modelSequenceCategoryForm = this.modelSequencesForm.controls.find((modelSequence) => modelSequence.value.category == this.modelSingleSequenceForm.get('category').value) as UntypedFormGroup;
        let modelSingleSequence = (modelSequenceCategoryForm.get('list') as UntypedFormArray).controls.find((modelSequence) => modelSequence.value._id == this.modelSingleSequenceForm.value._id) as UntypedFormGroup;
        if(modelSingleSequence.get('actions').value.length <= 0){
            this.deleteSequence(this.modelSingleSequenceForm.value);
        }
        this.modalRef.dismiss();
    }

    deleteAction(index:number) {
        let actions = this.modelSingleSequenceForm.get('actions') as UntypedFormArray;
        actions.removeAt(index);
    }

    dropAction(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.modelSingleSequenceForm.get('actions')['controls'], event.previousIndex, event.currentIndex);
        this.modelSingleSequenceForm.setControl('actions', this.formBuilder.array(this.modelSingleSequenceForm.get('actions')['controls']));
    }

    preventAccordion(index){
        const elem = document.getElementById('accordion_'+index);
        elem.setAttribute('data-bs-toggle', '');
    }

    activeAccordion(index){
        const elem = document.getElementById('accordion_'+index);
        elem.setAttribute('data-bs-toggle', 'collapse');
    }

    previousCurrentWizard(){
        this.currentWizardNumber = this.currentWizardNumber - 1;
    }

    reloadComponent() {
        window.location.reload();
    }

    _createModelAttribute(service:Service) {

        if(service.available_attributes.length > 0) {
            let modelAttributeGroup = this.formBuilder.group({
                id_model: ['', []],
                id_service: [service._id, []],
                type: service.name,
                attributes: this.formBuilder.array([]),
            });

            // Add attributes to the form
            let attributesArray = modelAttributeGroup.get('attributes') as UntypedFormArray;
            for(let attribute of service.available_attributes) {
                let attributesGroup = {};
                attributesGroup['available_options'] = new UntypedFormArray([]);

                // Check if modelAttributes has the option enabled
                const modelAttribute = this.modelAttributes.find((modelAttribute:ModelAttribute) => modelAttribute.id_service == service._id && modelAttribute.id_attribute == attribute['_id']);

                Object.keys(attribute).forEach(key => {
                    if(key === 'options') {
                        for(let option of attribute[key]){
                            let checked = true;
                            checked = (modelAttribute && !modelAttribute.available_options.find((availableOption) => availableOption.id == option.id)) ? false : true;
                            let optionsGroup;
                            if(option.path){
                                optionsGroup = this.formBuilder.group({
                                    id: [option.id, []],
                                    name: [option.name, []],
                                    path: [option.path, []],
                                    checked: checked
                                })
                            }
                            else{
                                optionsGroup = this.formBuilder.group({
                                    id: [option.id, []],
                                    name: [option.name, []],
                                    checked: checked
                                })
                            }
                           
                            let pushOptionsGroup = false;

                            if(attribute['type'] == 'other' && (option.id != 'orla' || (option.id == 'orla' && this.modelForm.get('fringe').value != 'none'))){
                                pushOptionsGroup = true;
                            }
                            else if(attribute['type'] == 'color' && (option.id == 1 || (option.id != 1 && this.modelForm.get('bicolor').value == true))){
                                pushOptionsGroup = true;
                            }
                            else if(attribute['type'] != 'other' && attribute['type'] != 'color'){
                                pushOptionsGroup = true;
                            }
                            if (pushOptionsGroup) attributesGroup['available_options'].push(optionsGroup);
                        }
                    }
                    else if(key === '_id') {
                        attributesGroup['id_attribute'] = new UntypedFormControl(attribute[key]);
                    }
                    else{
                        attributesGroup[key] = new UntypedFormControl(attribute[key]);
                    }
                });
                attributesArray.push(new UntypedFormGroup(attributesGroup));
            }
            this.modelAttributesForm.push(modelAttributeGroup);
        }
    }

    _removeModelAttribute(service:Service) {
        const onlineServices: UntypedFormArray = this.modelForm.get('online_services') as UntypedFormArray;
        const offlineServices: UntypedFormArray = this.modelForm.get('offline_services') as UntypedFormArray;
        
        if(!onlineServices.value.includes(service._id) && !offlineServices.value.includes(service._id)) {
            if(this.debug) console.log('removing model attribute...');
            const index = this.modelAttributesForm.value.findIndex(modelAttribute => modelAttribute.id_service == service._id);
            this.modelAttributesForm.removeAt(index);
            if(this.debug) console.log('removed model attribute: ' + service._id);
            if(this.debug) console.log(this.modelAttributesForm.value);
        }
    }

    _createModelSingleSequenceForm() {
        return this.formBuilder.group({
            _id:[],
            id_model: [],
            name: ['', Validators.required],
            category: ['', Validators.required],
            actions: this.formBuilder.array([]),
            default:[true]
        });
    }

    _checkDuplicates(){
        if(this.modelSequences.length == 0) return false;

        for(let sequence of this.modelSequences){
            if(sequence.category == this.modelSingleSequenceForm.value.category){
                if(sequence['list'].find(seq => seq.name === this.modelSingleSequenceForm.value.name)){
                    return true;
                }
            }
        }
        return false;
    }

    _getDefaultSequences() {
        if(!this.modelId){
            this.subscriptions['indexDefaultModelSequenceService'] = this.modelSequenceService.indexDefault(this.modelAttributes).subscribe((modelSequencesGroupByCategory:any) => {
                this._prepareDefaultSequences(modelSequencesGroupByCategory);
            });
        }
        else {
            this.subscriptions['indexDefaultByProductModelIdModelSequenceService'] = this.modelSequenceService.indexDefaultByProductModelId(this.modelId, this.modelAttributes).subscribe((modelSequencesGroupByCategory:any) => {
                this._prepareDefaultSequences(modelSequencesGroupByCategory);
            });
        }
    }

    _prepareDefaultSequences(modelSequencesGroupByCategory:any) {
        if(modelSequencesGroupByCategory.length > 0) {
            this.modelSequencesForm.clear();
            this.sequencesCount = 0;
            for(let category of modelSequencesGroupByCategory) {
                let modelSequenceCategoryForm = this.formBuilder.group({
                    name: [ category.name ],
                    category: [ category.category ],
                    list: this.formBuilder.array([])
                })
                for(let modelSequence of category.list) {
                    let modelSingleSequenceForm = this._createModelSingleSequenceForm();
                    let _id = (this.modelId) ? modelSequence._id : uuidv4();
                    modelSingleSequenceForm.get('_id').patchValue(_id);
                    modelSingleSequenceForm.get('name').patchValue(modelSequence.name);
                    modelSingleSequenceForm.get('category').patchValue(category.category);
                    if(this.modelId) modelSingleSequenceForm.get('id_model').patchValue(this.modelId);
                    this.sequencesCount++;
                    for(let action of modelSequence.actions) {
                        let actionForm = this.formBuilder.group({
                            _id: [ action._id ],
                            type: [ action.type ],
                            parameters: this.formBuilder.group({})
                        });
                        Object.keys(action.parameters).forEach(key => {
                            (actionForm.get('parameters') as UntypedFormGroup).addControl(key, new UntypedFormControl(action.parameters[key]));
                        });
                        (modelSingleSequenceForm.get('actions') as UntypedFormArray).push(actionForm);
                    }
                    (modelSequenceCategoryForm.get('list') as UntypedFormArray).push(modelSingleSequenceForm);
                }
                this.modelSequencesForm.push(modelSequenceCategoryForm);
            }
        }
        if(this.debug) console.log('\n DEFAULT SEQUENCES');
        if(this.debug) console.log(this.modelSequencesForm);
    }

    _createProductModel() {
        this.subscriptions['createProductModel'] = this.productModelService.create(this.modelForm.value).subscribe((productModel:ProductModel) => {
            this.productModel = productModel
            if(this.debug) console.log('PRODUCT MODEL CREATED SUCCESSFULLY');
            if(this.debug) console.log(this.productModel);

            // Assign id_model to modelAttributes 
            for(let modelAttribute of this.modelAttributes) {
                modelAttribute.id_model = this.productModel._id;
            }

            // Prepare modelSequences array
            for(let categoryGroup of this.modelSequencesForm.value) {
                categoryGroup.id_model = this.productModel._id;
                for(let sequence of categoryGroup.list){
                    for(let action of sequence.actions){
                        if(action.available_attributes) delete action.available_attributes
                    }
                    let modelSequence = new ModelSequence();
                    modelSequence.id_model = this.productModel._id;
                    modelSequence.name = sequence.name;
                    modelSequence.category = sequence.category;
                    modelSequence.actions = sequence.actions;
                    modelSequence.default = sequence.default
                    this.modelSequences.push(modelSequence);
                }
            }

            // Create model_attributes batch
            if(this.debug) console.log('\nSAVING MODEL ATTRIBUTES (BATCH)...');
            this.modelAttributeService.create(this.modelAttributes).subscribe((modelAttributes:ModelAttribute[]) => {
                if(this.debug) console.log('MODEL ATTRIBUTES (BATCH) CREATED SUCCESSFULLY');
                if(this.debug) console.log(modelAttributes);
            })

            // Create model_sequences batch
            if(this.debug) console.log('\nSAVING MODEL SEQUENCES (BATCH)...');
            this.modelSequenceService.create(this.modelSequences).subscribe((modelSequences:ModelSequence[]) => {
                if(this.debug) console.log('MODEL SEQUENCES (BATCH) CREATED SUCCESSFULLY');
                if(this.debug) console.log(modelSequences);
            });
        });
    }

    _updateProductModel() {
        // Assign id_model to modelAttributes 
        for(let modelAttribute of this.modelAttributes) {
            modelAttribute.id_model = this.productModel._id;
        }

        // Prepare modelSequences array
        for(let categoryGroup of this.modelSequencesForm.value) {
            categoryGroup.id_model = this.productModel._id;
            for(let sequence of categoryGroup.list){
                for(let action of sequence.actions){
                    if(action.available_attributes) delete action.available_attributes
                }
                let modelSequence = new ModelSequence();
                modelSequence.id_model = this.productModel._id;
                modelSequence.name = sequence.name;
                modelSequence.category = sequence.category;
                modelSequence.actions = sequence.actions;
                modelSequence.default = sequence.default
                this.modelSequences.push(modelSequence);
            }
        }

        // Update product_model
        this.subscriptions['updateProductModel'] = this.productModelService.update(this.modelId, this.modelForm.value).subscribe((productModel:ProductModel) => {
            this.productModel = productModel
            if(this.debug) console.log('PRODUCT MODEL UPDATED SUCCESSFULLY');
            if(this.debug) console.log(this.productModel);
        });

        // Update model_attributes batch
        if(this.debug) console.log('\nDELETING MODEL ATTRIBUTES (BATCH)...');
        this.modelAttributeService.deleteByProductModelId(this.modelId).subscribe(() => {
            if(this.debug) console.log('MODEL ATTRIBUTES (BATCH) DELETED SUCCESSFULLY');

            this.modelAttributeService.create(this.modelAttributes).subscribe((modelAttributes:ModelAttribute[]) => {
                if(this.debug) console.log('MODEL ATTRIBUTES (BATCH) CREATED SUCCESSFULLY');
                if(this.debug) console.log(modelAttributes);
            });
        });

        // Update model_sequences batch
        if(this.debug) console.log('\nDELETING MODEL SEQUENCES (BATCH)...');
        this.modelSequenceService.deleteByProductModelId(this.modelId).subscribe(() => {
            if(this.debug) console.log('\nSAVING MODEL SEQUENCES (BATCH)...');

            this.modelSequenceService.create(this.modelSequences).subscribe((modelSequences:ModelSequence[]) => {
                if(this.debug) console.log('MODEL SEQUENCES (BATCH) CREATED SUCCESSFULLY');
                if(this.debug) console.log(modelSequences);
            });
        });        
    }
    
    optionAvailable(option){
        var attribute = this.actionForm.value.available_attributes.find(att => att.type === 'other')
        if(attribute) return this.actionForm.value.available_attributes.find(att => att.type === 'other').available_options.find(opt => opt.id === option).checked;        
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
    async showHelpModal(){
        this.modalRef3 = this.modalService.open(this.showRowsModal, { ariaLabelledBy: 'modal-basic-title' });
    }

    validateForm(){
        let valid = true;
        for(let attribute of this.getModelAttributeForm().get('attributes')['controls']){
            if(attribute.value.type != 'other' && attribute.value.type != 'message' && attribute.value.type != 'path' && attribute.value.type != 'img'){
                let allUnchecked = true;
                for(let option of attribute.value.available_options){
                    if(option.checked) allUnchecked = false;
                }
                if(allUnchecked) {
                    valid = false;
                    this.toastService.show('Seleccione al menos una opción de ' + attribute.value.name + '.', { classname: 'bg-danger text-white' });
                }
            }
        }
        if(valid) this.modalRef.dismiss();
    }

    checkOtherOptions(available_options){
        for(let option of available_options){
            if(option.checked == true) {
                return true;
            }
        }
        return false;
    }
}