import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";

import { AuthService } from "../auth.service";

@Component({
    styleUrl: './signup.component.css',
    templateUrl: './signup.component.html'
})
export class SignupComponent {
    isLoading = false;

    // Injecting HttpClient in service to centralize the access
    constructor(public authService: AuthService) {}

    onSignup(form: NgForm) {
        if (form.invalid) {
            return;
        }
        this.isLoading = true;
        this.authService.registerUser(form.value.email, form.value.password);
    }
}