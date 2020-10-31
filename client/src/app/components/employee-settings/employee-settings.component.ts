import {Component, Input, OnInit} from '@angular/core';
import {ManageMembersService} from "../../services/manage-members.service";
import {ActivatedRoute} from "@angular/router";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrls: ['./employee-settings.component.scss']
})
export class EmployeeSettingsComponent implements OnInit {
  @Input() employee: User;
  @Input() employee_copy: User;
  edit: boolean = false;
  defaultPassword: string = "XXXXXXXXXXXX";
  password: string = this.defaultPassword;
  @Input() role: string;
  @Input() is_active: string;
  id: string;

  active_states = [
    {state: 'active'}, {state: 'disabled'}
  ]
  roles = [
    { name: 'System Admin', abbrev: 'SA' },
    { name: 'Inventory Manager', abbrev: 'IM' },
    { name: 'Stock Keeper', abbrev: 'SK' },
  ];

  constructor(private manageMembersService: ManageMembersService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get("ID");

    this.manageMembersService.getEmployee(this.id).subscribe(employee => {
      this.employee = {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        is_active: employee.is_active,
        email: employee.email,
      };

      this.setSelectors();
      this.employee_copy = this.employee
    })

  }

  setSelectors(): void {
    this.is_active = this.employee.is_active? "active": "disabled";
    this.roles.forEach(role => {
      if(role.abbrev === this.employee.role) this.role = role.name;
    });
  }

  editMode(turnOn: boolean): void {
    this.edit = turnOn;
    if(!turnOn) {
      this.employee = this.employee_copy;
      this.setSelectors();
    }
  }

  submit(): void {
    this.employee.is_active = this.is_active === "active";

    this.roles.forEach(role => {
      if(role.name === this.role) {
        this.employee.role = role.abbrev;
      }
    })

    this.manageMembersService.updateClientInfo(this.employee, this.id).subscribe(response => {
      location.reload();
    });
  }

}