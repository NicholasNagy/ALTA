import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProfilePopoverMenuComponent } from 'src/app/components/toolbar/popovers/profile-popover-menu/profile-popover-menu.component';
import { NotificationPopoverMenuComponent } from 'src/app/components/toolbar/popovers/notification-popover-menu/notification-popover-menu.component';
import { fetchLoggedInUser } from 'src/app/services/cache';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  loggedInUser: string;
  constructor(
    public popoverController: PopoverController,
    private router: Router,
  ) { }

  ngOnInit() { }

  async presentProfilePopover(ev: any) {
    const { username } = await fetchLoggedInUser();
    const popover = await this.popoverController.create({
      component: ProfilePopoverMenuComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
      componentProps: { loggedInUser: username },
    });
    return await popover.present();
  }

  async presentNotificationPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: NotificationPopoverMenuComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
    });
    return await popover.present();
  }

  navigate(){
    this.router.navigateByUrl('/audits', { replaceUrl: true });
  }

}
