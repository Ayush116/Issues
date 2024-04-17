import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { AuthData } from "./auth-data.model";

@Injectable({providedIn: 'root'})
export class AuthService {
    private isAuth = false;
    private token?: string | undefined;
    private tokenTimer: any;
    private userId?: string | undefined;
    private authStatusListener = new Subject<boolean>();
    
    // Injecting HttpClient, Router in service to centralize the access
    constructor(private httpClient: HttpClient, public router: Router) {}

    getToken() {
        return this.token;
    }

    getUserId() {
        return this.userId;
    }

    getIsAuthenticated() {
        return this.isAuth;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    registerUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.httpClient.post('http://localhost:3000/api/user/signup', authData)
            .subscribe(response => {
                // console.log(response);
                this.router.navigate(["/create"]);
            });
    }

    loginUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.httpClient.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
            .subscribe(response => {
                console.log("Auth-service:: response: ", response);
                const token = response.token;
                this.token = token;
                if (token) {
                    const expiredInDuration = response.expiresIn;
                    const currentDate = new Date();
                    const expirationDate = new Date(currentDate.getTime() + expiredInDuration * 1000);
                    this.setAuthTimer(expiredInDuration);
                    this.isAuth = true;
                    this.userId = response.userId;
                    console.log("Auth-service:: userID: ", this.userId);
                    this.authStatusListener.next(true);
                    // console.log(expirationDate);
                    this.saveAuthData(token, expirationDate, this.userId);
                    this.router.navigate(["/"]);
                }
            });
    }

    autoAuthUser() { // If data is available in localStorage then auto authenticate the USER
        const authInfo = this.getAuthData();
        if (!authInfo) {
            return;
        }
        const now = new Date();
        const expiresIn = authInfo!.expirationDate.getTime() - now.getTime();
        // const inFuture = authInfo?.expirationDate! > now;
        // if (inFuture) {
        if (expiresIn > 0) {
            this.token = authInfo?.token!;
            this.isAuth = true;
            this.userId = authInfo.userId!;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    userLogout() {
        this.isAuth = false;
        this.token = '';
        this.userId = '';
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer); // clearing the timeout that is getting set ON on loginUser().
        this.clearAuthData();
        this.router.navigate(["/"]);
    }

    private setAuthTimer(duration: number) {
        // console.log("Setting Timer for " + duration);
        this.tokenTimer = setTimeout(() => {
            this.userLogout();
        }, duration * 1000); // setTimeout() works with 'milli-seconds'
    }

    private saveAuthData(token: string, expiredDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expiredDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        // localStorage.removeItem('token');
        // localStorage.removeItem('expiration');
        // localStorage.removeItem('userId');
        localStorage.clear();
    }

    private getAuthData() {
        if (typeof localStorage !== 'undefined') {
            const token = localStorage.getItem('token');
            const expirationDate = localStorage.getItem('expiration');
            const userId = localStorage.getItem('userId');
            if (!token || !expirationDate) {
                return;
            }
            return { // getting fields, fetched from localStorage
                token: token,
                expirationDate: new Date(expirationDate!),
                userId: userId
            };
        }
    }
}