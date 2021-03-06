import {Component, Input} from '@angular/core';
import {ManageMembersService} from '../../../../services/users/manage-members.service';
import {ActivatedRoute} from '@angular/router';
import roles from 'src/app/fixtures/roles.json';
import {BaseEmployeeForm, EmployeeView} from '../employee-view';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService, UserLocalStorage} from '../../../../services/authentication/auth.service';

@Component({
  selector: 'app-employee-settings',
  templateUrl: '../employee-view.component.html',
  styleUrls: ['../employee-view.component.scss'],
})
export class EditEmployeeComponent extends EmployeeView {
  @Input() employee: any;
  edit = false;
  password = '';
  @Input() role: string | undefined;
  @Input() isActive: string | undefined;
  id: string | undefined;
  isLoggedInUser: BehaviorSubject<boolean> | undefined;
  isSystemAdmin = false;

  alwaysDisabled = ['email', 'id'];

  activeStates = [{ state: 'active' }, { state: 'disabled' }];
  roles = roles;

  employeeForm: FormGroup | undefined;

  constructor(
    private manageMembersService: ManageMembersService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    super();
    // If the ID changes in the route param then reload the component
    this.activatedRoute.params.subscribe((routeParams) => {
      this.id = routeParams.ID ? routeParams.ID : this.authService.getLocalStorage(UserLocalStorage.UserID);

      // Verifying that the logged in user is accessing their own information
      if (this.id === this.authService.getLocalStorage(UserLocalStorage.UserID)) {
        // tslint:disable-next-line:no-non-null-assertion
        // @ts-ignore
        this.isLoggedInUser.next(true);
      }
      this.getEmployee();
    });
  }

  getTitle(): string {
    // need to initialize here because the super constructor needs to be the first thing that gets called
    this.isLoggedInUser = new BehaviorSubject<boolean>(false);
    const generateString = () => (this.isLoggedInUser?.getValue() ? 'Profile' : 'Employee') +  ' Settings';

    // put a subscription in case of changes for whether the user is logged in or not
    this.isLoggedInUser.subscribe(_ => {
      this.title = generateString();
    });
    return generateString();
  }

  getIsEdit(): boolean {
    return true;
  }

  getEmployee(): void {
    // tslint:disable-next-line:no-non-null-assertion
    this.manageMembersService.getEmployee(this.id!).subscribe((employee) => {
      this.employee = {
        role: employee.role,
        is_active: employee.is_active,
      };
      this.setSelectors();
      this.employeeForm = this.fb.group({
        // Each username,email,password is piped from the HTML using the "formControlName"
        id: new FormControl({value: employee.id, disabled: !this.edit}, [Validators.required]),
        email: new FormControl({value: employee.email, disabled: !this.edit}, [Validators.email, Validators.required]),
        first_name: new FormControl({value: employee.first_name, disabled: !this.edit}, [Validators.required]),
        last_name: new FormControl({value: employee.last_name, disabled: !this.edit}, [Validators.required]),
        location: !this.isSystemAdmin ?
          new FormControl({value: employee.location, disabled: !this.isSystemAdmin}, [Validators.required]) :
          undefined,
      });
      this.isLoaded();
    });
  }

  setSelectors(): void {
    this.isActive = this.employee.is_active ? 'active' : 'disabled';
    if (this.employee.role === 'SA') {
      this.isSystemAdmin = true;
    } else {
      this.roles = this.roles.filter(({ abbrev}) => abbrev !== 'SA');
    }

    this.roles.forEach((role) => {
      if (role.abbrev === this.employee.role) {
        this.role = role.name;
      }
    });
  }

  editMode(turnOn: boolean): void {
    this.edit = turnOn;
    // @ts-ignore
    Object.keys(this.employeeForm.controls).forEach(key => {
      if (this.alwaysDisabled.indexOf(key) < 0) {
        this.employeeForm?.controls[key].enable();
      }
    });
    if (!turnOn) {
      this.submitForm();
    }
  }

  // Will be used to reload (refresh) the page when the cancel button is clicked
  reloadPage(): void {
    window.location.reload();
  }

  submitQuery(base: BaseEmployeeForm): void {
    // update user info
    this.employee.is_active = this.isActive === 'active';

    this.roles.forEach((role) => {
      if (role.name === this.role) {
        this.employee.role = role.abbrev;
      }
    });

    // employee info needs to be overridden/replaced by the body of the form, since it's not updated by user input
    const patchedEmployee = {...this.employee, ...base};

    delete patchedEmployee.id;
    delete patchedEmployee.email;

    this.manageMembersService
      // tslint:disable-next-line:no-non-null-assertion
      .updateClientInfo(patchedEmployee, this.id!)
      .subscribe((response) => {
        // update user password
        if (this.password.length > 0) {
          // tslint:disable-next-line:no-non-null-assertion
          this.manageMembersService.updatePassword({password: this.password}, this.id!).subscribe(
             _ => {
              location.reload();
            },
            (err) => {
              console.log(err);
            }
          );
        } else {
          location.reload();
        }
      });
  }
}
