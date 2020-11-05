import { Component, OnInit } from '@angular/core';
import { SideNavOption } from './sidenavOption';
import { AuthService } from 'src/app/services/auth.service';
import { SystemNavListings, OrganizationNavListings } from './sidenavListing';
import {Router} from "@angular/router";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SideNavComponent implements OnInit {
  // contains the listing of all sidenav menu items
  options = SystemNavListings;
  // contains the last option chosen, it defaults to the first
  selectedOption: SideNavOption;

  subscription;
  loggedInUser;
  loggedInUserRole;

  roles = {
    "SA": "System Administrator",
    "IM": "Inventory Manager",
    "SK": "Stock Keeper"
  }

  constructor(private router: Router,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.selectedOption = this.options[0];
    this.subscription = this.authService.getOrgMode().subscribe(orgMode => {
      if (orgMode) {
        this.options = OrganizationNavListings;
      } else {
        this.options = SystemNavListings;
      }
    });
    this.subscription = this.authService.sharedUser
      .subscribe((data) => {
        this.loggedInUser = data.username;
        this.loggedInUserRole = this.roles[data.role];
      });
  }

  exitOrg(): void {
    this.authService.turnOffOrgMode();
  }

  onDestroy() {
    this.subscription.unsubscribe();
  }
}
