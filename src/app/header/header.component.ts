import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { AuthService } from "../auth/auth.service";

@Component({
    selector: 'app-header',
    styleUrl: './header.component.css',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
    userIsAuth = false;
    private authListenerSubs!: Subscription;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.userIsAuth = this.authService.getIsAuthenticated();
        this.authListenerSubs = this.authService.getAuthStatusListener()
            .subscribe(isAuth => {
                this.userIsAuth = isAuth;
            });
    }

    onLogout() {
        this.authService.userLogout();
    }

    ngOnDestroy() {
        this.authListenerSubs.unsubscribe();
    }
}