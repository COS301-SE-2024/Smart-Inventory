import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './loginCreateAccount.component.html',
    styleUrls: ['./loginCreateAccount.component.scss'],
})
export class LoginCreateAccountComponent implements OnInit {
    login: any;
    darkMode: boolean = false;
    signIn: boolean = true;

    constructor() {}

    ngOnInit() {
        this.login = new FormGroup({
            username: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
        });
    }

    //Changes the screen between sign in and create account and changes the form group
    changeScreen() {
        try {
            if (this.signIn) {
                this.signIn = false;
                this.login = new FormGroup({
                    name: new FormControl('', Validators.required),
                    surname: new FormControl('', Validators.required),
                    email: new FormControl('', Validators.required),
                    compName: new FormControl('', Validators.required),
                    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
                    repPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
                });
            } else {
                this.signIn = true;
                this.login = new FormGroup({
                    username: new FormControl('', Validators.required),
                    email: new FormControl('', Validators.required),
                    password: new FormControl('', Validators.required),
                });
            }
        } catch {}
    }

    //Changes from light mode to dark mode
    changeMode() {
        try {
            this.darkMode = this.darkMode === true ? false : true;
        } catch {}
    }

    //Saves the values inserted and makes a call to the API to save the data
    onSave() {
        try {
        } catch {}
    }
}
