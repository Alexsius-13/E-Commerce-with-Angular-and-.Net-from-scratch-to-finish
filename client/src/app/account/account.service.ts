import { Injectable } from '@angular/core';
import { BehaviorSubject, map, of, ReplaySubject } from 'rxjs';
import { Address, User } from '../shared/models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseApiUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User | null>(1);
  currentUserSource$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  loadCurrentUser(token: string | null) {
    if(token === null){
      this.currentUserSource.next(null);
      return of(null);
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);
    
    return this.http.get<User>(this.baseApiUrl + 'account', {headers}).pipe(
      map(user => {
        if(user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
          return user;
        }
        else {
          return null;
        }
      })
    )
  }

  login(values: any){
    return this.http.post<User>(this.baseApiUrl + 'account/login', values).pipe(
      map(user => {
        localStorage.setItem('token', user.token);
        this.currentUserSource.next(user);
      })
    )
  }

  register(values: any){
    return this.http.post<User>(this.baseApiUrl + 'account/register', values).pipe(
      map(user => {
        localStorage.setItem('token', user.token);
        this.currentUserSource.next(user);
      })
    )
  }

  logout(){
    localStorage.removeItem('token');
    this.currentUserSource.next(null);
    this.router.navigateByUrl('/');
  }

  checkEmailExists(email: string){
    return this.http.get<boolean>(this.baseApiUrl + 'account/emailExists?email=' + email);
  }

  getUserAddress() {
    return this.http.get<Address>(this.baseApiUrl + 'account/address');
  }

  updateUserAddress(address: Address) {
    return this.http.put(this.baseApiUrl + 'account/address', address);
  }
}
