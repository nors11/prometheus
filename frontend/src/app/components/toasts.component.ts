import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
    selector: 'tecneplas-toasts',
    templateUrl: '../views/toasts.component.html',
    host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastsComponent {
    constructor(
        public toastService: ToastService
    ) {}
}
