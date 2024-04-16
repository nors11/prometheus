import { Component, Input, OnInit } from '@angular/core';
import { Account, UserRole } from 'src/app/modules/account/models/account';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/modules/account/services/user.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';

@Component({
    selector: 'tecneplas-users',
    templateUrl: '../../views/users/users.component.html',
})
export class UsersComponent implements OnInit {

    @Input() pharmacy;
    public accounts: Account[]
    public countUsers: number;
    public modalRef: NgbModalRef;
    public user: Account;
    public userRole = UserRole;
    public model;

    constructor(
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private router: Router,
        private userService: UserService,
        private toastService: ToastService,
    ) { }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.getUsers();
    }

    getUsers(newValue?) {
        if(newValue) this.model = newValue;
        if(this.pharmacy)
        {
            this.userService.findUsersByPharmacy(this.pharmacy._id, newValue).subscribe(
                (accounts: Account[]) => {
                    this.accounts = accounts['accounts'];
                    this.countUsers = accounts['countUsers'];
                }
            )
        }
        else{
            this.userService.index(newValue).subscribe(
                (accounts: Account[]) => {
                    this.accounts = accounts['accounts'];
                    this.countUsers = accounts['countUsers'];
                }
            )
        }
    }

    openRemoveClient(deleteActionModal, user: Account) {
        this.modalRef = this.modalService.open(deleteActionModal, { ariaLabelledBy: 'modal-basic-title' });
        this.user = user;
    }

    removeClient() {
        this.userService.delete(this.user['_id']).subscribe(
            res => {
                this.modalRef.dismiss();
                this.getUsers();
                this.toastService.show(`El cliente ${this.user.name} ha sido eliminado.`, { classname: 'bg-success text-white' });
            }
        )
    }

    status(account, status) {
        this.userService.update(account['_id'], { status: status }).subscribe(
            res => {
                if (status === false) this.toastService.show(`El cliente ${res.name} ha sido desactivado.`, { classname: 'bg-success text-white' });
                if (status === true) this.toastService.show(`El cliente ${res.name} ha sido activado.`, { classname: 'bg-success text-white' });
                this.getUsers();
            },
            error => {
                console.log(error)
            }
        );
    }

    newUser(){
        if(this.pharmacy){
            this.router.navigate(['users/new'], {queryParams: {pharmacy: this.pharmacy._id}});
        }
        else{
            this.router.navigate(['users/new']);
        }
    }

    valuechange(newValue) {
        this.getUsers(newValue);
    }
}