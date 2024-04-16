import { AbstractControl } from '@angular/forms';

const DNI_REGEX = /^(\d{8})([A-Z])$/;
const CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
const NIE_REGEX = /^[XYZ]\d{7,8}[A-Z]$/;

export function NifValidator(control: AbstractControl) {

    // Ensure upcase and remove whitespace
    const nif: string = control.value.toUpperCase().replace(/\s/, '').replace(/\-/, '').replace(/\-/, '');

    let valid: boolean = false;
    const type: string = idType( nif );

    switch (type) {
        case 'DNI':
            valid = validateDNI( nif );
            break;
        case 'NIE':
            valid = validateNIE( nif );
            break;
        case 'CIF':
            valid = validateCIF( nif );
            break;
    }

    return (!valid) ? { invalid: true } : null;
}

function idType(nif: string) {
    if ( nif.match( DNI_REGEX ) ) {
        return 'DNI';
    }
    if ( nif.match( CIF_REGEX ) ) {
        return 'CIF';
    }
    if ( nif.match( NIE_REGEX ) ) {
        return 'NIE';
    }
}

function validateDNI(nif: string) {
    const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const letter = dniLetters.charAt( parseInt( nif, 10 ) % 23 );

    return (letter === nif.charAt(8));
}

function validateNIE(nif: string) {
    // Change the initial letter for the corresponding number and validate as DNI
    let niePrefix: any = nif.charAt( 0 );

    switch (niePrefix) {
        case 'X': niePrefix = 0; break;
        case 'Y': niePrefix = 1; break;
        case 'Z': niePrefix = 2; break;
    }

    return validateDNI( niePrefix + nif.substr(1) );
}

function validateCIF(nif: string) {
    const match = nif.match( CIF_REGEX );
    const letter  = match[1];
    const num  = match[2];
    const control = match[3];
    const letters = ['J', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    let sum = 0;
    let digit;

    for ( let i = 0; i < num.length; i++) {
        digit = parseInt( num[i], 10 );

        // Odd positions (Even index equals to odd position. i=0 equals first position)
        if ( i % 2 === 0 ) {
            // Odd positions are multiplied first.
            digit *= 2;

            // If the multiplication is bigger than 10 we need to adjust
            sum += digit < 10 ? digit : digit - 9;

            // Even positions
            // Just sum them
        } else {
            sum += digit;
        }
    }

    sum %= 10;
    if (sum !== 0) {
        digit = 10 - sum;
    } else {
        digit = sum;
    }

    if (letter.match(/[ABEH]/)) {
        return digit.toString() === control;
    }
    if (letter.match(/[NPQRSW]/)) {
        return letters[digit] === control;
    }

    return digit.toString() === control || letters[digit] === control;
}