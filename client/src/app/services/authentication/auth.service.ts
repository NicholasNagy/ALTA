import {env} from 'src/environments/environment';
// @ts-ignore
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject, combineLatest} from 'rxjs';
import {map, debounceTime} from 'rxjs/operators';
import {Router} from '@angular/router';

// Connection with the backend
const BASEURL = env.api_root;

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private observables: any = {};

  orgMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(!!this.getLocalStorage(LocalStorage.OrgId));

  subscription;

  // Access Observables through mapped data (initialized to an observable here, but initialized actually in constructor)
  sharedUser: Observable<any>;

  constructor(
    private http: HttpClient, // We inject the http client in the constructor to do our REST operations
    private router: Router) {
    this.initializeObservables();
    this.sharedUser = this.getSharedUser();

    if (this.getLocalStorage(LocalStorage.UserID)) {
      this.subscription = this.getCurrentUser(this.getLocalStorage(LocalStorage.UserID) as string)
        .subscribe((data) => {
          this.updateLocalStorage(LocalStorage.UserID, data.user_id);
          this.updateLocalStorage(LocalStorage.Username, data.user_name);
          this.updateLocalStorage(LocalStorage.Role, data.role);
          this.updateLocalStorage(LocalStorage.OrgId, data.organization);
          this.updateLocalStorage(LocalStorage.OrgName, this.getLocalStorage(LocalStorage.OrgName) as string);
          // TODO: update GET call to return organization's name
          if (data.role === 'IM') {
            this.turnOnOrgMode({organization_name: this.getLocalStorage(LocalStorage.OrgName), ...data}, false);
          }
        });
    }
  }

  initializeObservables(): void {
    // tslint:disable-next-line:forin
    for (const localStorageKey of Object.values(LocalStorage)) {
      this.observables[localStorageKey] = new BehaviorSubject('');
    }
  }

  getSharedUser(): Observable<any> {
    return combineLatest([this.observables[LocalStorage.UserID].asObservable(),
      this.observables[LocalStorage.Username].asObservable(),
      this.observables[LocalStorage.Role].asObservable(),
      this.observables[LocalStorage.OrgId].asObservable(),
      this.observables[LocalStorage.OrgName].asObservable()])
      .pipe(map(([userId, username, role, orgId, org]) => {
        return {
          userId: this.observables[LocalStorage.UserID].value,
          username: this.observables[LocalStorage.Username].value,
          role: this.observables[LocalStorage.Role].value,
          orgId: this.observables[LocalStorage.OrgId].value,
          org: this.observables[LocalStorage.OrgName].value
        };
      }), debounceTime(0));
  }

  getOrgMode(): BehaviorSubject<boolean> {
    return this.orgMode;
  }

  setOrgMode(state: boolean): void {
    this.orgMode.next(state);
  }

  updateLocalStorage(storageId: LocalStorage, value: any): void {
    localStorage.setItem(storageId, value);
    this.observables[storageId].next(value);
  }

  getLocalStorage(storageId: LocalStorage): string | null {
    return localStorage.getItem(storageId);
  }

  removeFromLocalStorage(storageId: LocalStorage): void {
    localStorage.removeItem(storageId);
    this.observables[storageId].next('');
  }

  turnOnOrgMode(org: any, doNavigate: boolean): void {
    this.updateLocalStorage(LocalStorage.OrgId, org.organization);
    this.updateLocalStorage(LocalStorage.OrgName, org.organization_name);
    this.orgMode.next(true);
    if (doNavigate) {
      this.router.navigate(['dashboard']);
    }
  }

  turnOffOrgMode(): void {
    if (this.observables[LocalStorage.Role].getValue() === 'SA') {
      this.removeFromLocalStorage(LocalStorage.OrgId);
      this.removeFromLocalStorage(LocalStorage.OrgName);
      this.router.navigate(['manage-organizations']);
      this.orgMode.next(false);
    } else {
      this.router.navigate(['dashboard']);
    }

  }

  register(body: object): Observable<any> {
    return this.http.post(`${BASEURL}/user/`, body);
  }

  getCurrentUser(id: string): Observable<any> {
    return this.http.get(`${BASEURL}/user/${id}/`);
  }

  openRegister(body: object): Observable<any> {
    return this.http.post(`${BASEURL}/open-registration/`, body);
  }

  login(body: object): Observable<any> {
    return this.http.post(`${BASEURL}/login/`, body);
  }

  loginMobile(body: object): Observable<any> {
    return this.http.post(`${BASEURL}/login-mobile/`, body);
  }

  setNext(nextUserId: any, nextUser: any, nextRole: any, nextOrgId: any, nextOrg: any): void {
    this.updateLocalStorage(LocalStorage.UserID, nextUserId);
    this.updateLocalStorage(LocalStorage.Username, nextUser);
    this.updateLocalStorage(LocalStorage.Role, nextRole);
    this.updateLocalStorage(LocalStorage.OrgId, nextOrgId);
    this.updateLocalStorage(LocalStorage.OrgName, nextOrg);
  }

  setLogOut(): void {
    this.setNext('', '', '', '', '');
    this.removeFromLocalStorage(LocalStorage.UserID);
    this.removeFromLocalStorage(LocalStorage.Role);
    this.removeFromLocalStorage(LocalStorage.Username);
    this.removeFromLocalStorage(LocalStorage.OrgName);
    this.removeFromLocalStorage(LocalStorage.OrgId);
  }

  OnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}


enum LocalStorage {
  UserID = 'id',
  Role = 'role',
  OrgName = 'organization',
  OrgId = 'organization_id',
  Username = 'username'
}
