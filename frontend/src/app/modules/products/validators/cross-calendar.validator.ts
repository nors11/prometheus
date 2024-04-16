import { FormGroup, Validators } from '@angular/forms';

export function calendarAllDayValidator(formGroup: FormGroup) {
    if(formGroup.value.all_day === false) {
        formGroup.get('time_start')?.setValidators([Validators.required])
        formGroup.get('time_end')?.setValidators([Validators.required])
    }
    else {
        formGroup.get('all_day')?.setValidators([Validators.required])
    }
    
}  