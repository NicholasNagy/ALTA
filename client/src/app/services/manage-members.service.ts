import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ManageMembersService {
  // Connection with the backend
  BASEURL = 'http://localhost:8000';

  constructor(private http: HttpClient) { } // We inject the http client in the constructor to do our REST operations

  getAllClients(): Observable<any> {
    return this.http.get<User[]>(`${this.BASEURL}/getAllClients/`)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error: ${err.status}: ${err.error}`);
        return EMPTY; // TODO: Implement proper error handling
      })
    );
  }

  getSpecificClients(name): Observable<any>
  {
    return this.http.post(`${this.BASEURL}/getSomeClients/`, JSON.stringify(name));
  }
}