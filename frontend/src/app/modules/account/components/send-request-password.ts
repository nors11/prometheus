import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: '../views/send-request-password.component.html',
  styleUrls: ['../css/login.component.scss']
})
export class SendResetPasswordComponent implements OnInit {

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
        
    }
    

}