import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = "https://forsynthia.shares.zrok.io/check-in-system-api";
  private loginUrl = `${this.apiUrl}/login.php`;
  private signUpUrl = `${this.apiUrl}/signup.php`;

  private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  signup(credentials: {username: string; password: string}): Observable<any> {
    return this.http.post<any>(this.signUpUrl, credentials);
  }

  login(credentials: {username: string; password: string}): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(){
    return this.currentUserSubject.value;
  }
}
