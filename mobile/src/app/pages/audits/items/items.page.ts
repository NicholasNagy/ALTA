import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  Platform,
  AlertController,
  ToastController,
  ModalController,
  ActionSheetController,
  LoadingController
} from '@ionic/angular';
import { Subscription, fromEvent } from 'rxjs';
import { AuditService } from 'src/app/services/audit.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { fetchLoggedInUser } from 'src/app/services/cache';
import { ActivatedRoute } from '@angular/router';
import { RecordPage } from 'src/app/pages/audits/items/record/record.page';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
})
export class ItemsPage implements OnInit, OnDestroy {
  barcode: string;
  scannedMessage: string;
  keypressEvent: Subscription;
  isScanning: boolean;
  loggedInUser: any;
  currentSegment = 'items';
  items: any;
  completedItems: any;
  auditID: string;
  binID: string;
  refreshEvent: any;

  constructor(
    private auditService: AuditService,
    public toastController: ToastController,
    public alertController: AlertController,
    private cd: ChangeDetectorRef,
    private cameraScanner: BarcodeScanner,
    private androidPermissions: AndroidPermissions,
    public platform: Platform,
    private activatedRoute: ActivatedRoute,
    public modalController: ModalController,
    public actionSheetController: ActionSheetController,
    private loadingController: LoadingController
  ) {
    this.barcode = '';
  }

  ngOnInit() {
    this.setPermissions();
    this.getSelectedBin();
    this.getItems();
    this.setExternalScanListener();
  }

  ngOnDestroy() {
    this.keypressEvent.unsubscribe();
  }

  setPermissions() {
    if (this.platform.is('android')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has Android Camera Permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );
    }
  }

  getSelectedBin() {
    this.auditID = this.activatedRoute.snapshot.paramMap.get('audit_id');
    this.binID = this.activatedRoute.snapshot.paramMap.get('bin_id');
  }

  getItems() {
    fetchLoggedInUser().then(
      user => {
        if (user) {
          this.loggedInUser = user;
          this.auditService.getItems(
            user.user_id,
            this.auditID,
            this.binID
          ).subscribe(
            (res: any) => {
              this.items = res;
              this.finishRefresh();
            });
        }
      });
  }

  getCompletedItems() {
    this.auditService.getCompletedItemsBin(
      this.loggedInUser.user_id,
      this.auditID,
      this.binID
    ).subscribe(
      (res: any) => {
        this.completedItems = res;
        this.finishRefresh();
      });
  }

  setExternalScanListener() {
    // A Keyboard Event is triggered from an external bluetooth scanner
    this.keypressEvent = fromEvent(document, 'keypress').subscribe(event => {
      this.scanStateChanged(true);
      this.handleKeyboardEvent(event as KeyboardEvent);
    });
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key;
    // The last key is always 'Enter'
    if (key === 'Enter') {
      this.finishScan();
    }
    else {
      this.barcode += key;
    }
  }

  handleCameraScan() {
    this.cameraScanner.scan().then(barcodeData => {
      if (barcodeData.cancelled === false) {
        this.barcode = barcodeData.text;
        this.finishScan();
      }
    }).catch(async err => {
      console.log('Camera Scanner Error:', err);
      if (err === 'Illegal access') {
        const toast = await this.toastController.create({
          message: 'Camera Permission Denied',
          duration: 1000,
        });
        toast.present();
      }
    });
  }

  async handleManualInput() {
    const alert = await this.alertController.create({
      header: 'Input Barcode',
      inputs: [
        {
          name: 'barcode',
          type: 'text',
          placeholder: 'Barcode #'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: input => {
            if (input && input.barcode) {
              this.barcode = input.barcode;
              this.finishScan();
            }
          }
        }
      ]
    });
    await alert.present();
  }


  finishScan() {
    this.validateItem();
  }

  handleItemClick(itemID) {
    this.barcode = itemID;
    this.validateItem();
  }

  async validateItem() {
    const whileLoading = await this.loadingController.create();
    if (!this.isScanning) {
      await whileLoading.present();
    }

    this.auditService.getItem(
      this.loggedInUser.user_id,
      this.auditID,
      this.binID,
      this.barcode).subscribe(
        async (res) => {
          await whileLoading.dismiss();
          const modalData = {
            itemData: res,
            customuser_id: this.loggedInUser.user_id,
            auditID: this.auditID,
            binID: this.binID,
          };
          this.presentRecordModal(modalData);
          this.scanStateChanged(false);
          this.barcode = '';
        },
        async (res) => {
          let header = 'No Match';
          let message = `There was no match for #${this.barcode}`;
          await whileLoading.dismiss();
          if (res.error?.inAudit) {
            header = 'Item Not Part of Bin';
            message = `This item is part of the current audit but belongs to another bin (#${res.error.inAudit}).`;
          }
          const alert = await this.alertController.create({
            header,
            message,
            buttons: ['Dismiss'],
          });
          this.scanStateChanged(false);
          await alert.present();
          this.barcode = '';
        });
  }


  getRecord(recordID) {
    this.auditService.getRecord(
      this.loggedInUser.user_id,
      this.auditID,
      this.binID,
      recordID).subscribe(
        (record: any) => {
          const modalData = {
            itemData: record,
            customuser_id: this.loggedInUser.user_id,
            auditID: this.auditID,
            binID: this.binID,
          };
          this.presentRecordModal(modalData);
        });
  }

  async deleteRecord(recordID) {
    const whileLoading = await this.loadingController.create();
    await whileLoading.present();

    this.auditService.deleteRecord(recordID).subscribe(
      async (res) => {
        await whileLoading.dismiss();
        const alert = await this.alertController.create({
          header: 'Record Deleted',
          message: 'The record has been successfully deleted.',
          buttons: ['Dismiss'],
        });
        await alert.present().then(_ => {

        });
      },
      async (res) => {
        await whileLoading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'There was a problem deleting this record.',
          buttons: ['Dismiss'],
        });
        await alert.present();
      });
  }


  async presentDeleteRecordAlert(recordID) {
    const alert = await this.alertController.create({
      header: 'Delete Record',
      message: 'Are you sure you want to delete this record ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Delete',
          handler: () => {
            this.deleteRecord(recordID);
          }
        }
      ]
    });
    await alert.present();
  }


  scanStateChanged(isScanning: boolean) {
    if (this.isScanning !== isScanning) {
      this.isScanning = isScanning;
      this.cd.detectChanges();
    }
  }

  segmentChanged(ev: CustomEvent) {
    this.currentSegment = ev.detail.value;

    if (this.currentSegment === 'items' && !this.items) {
      this.getItems();
    }
    else if (this.currentSegment === 'completedItems' && !this.completedItems) {
      this.getCompletedItems();
    }
  }

  async presentRecordModal(data) {
    this.keypressEvent.unsubscribe();
    const modal = await this.modalController.create({
      component: RecordPage,
      cssClass: 'record-modal',
      showBackdrop: true,
      componentProps: {
        modalData: data,
      }
    });
    modal.onDidDismiss()
      .then((res) => {
        if (res.data?.itemValidated) {
          this.doRefresh(null);
        }
        this.setExternalScanListener();
      });
    return await modal.present();
  }

  async doRefresh(event) {
    this.refreshEvent = event;
    if (this.currentSegment === 'completedItems') {
      this.getCompletedItems();
    }
    this.getItems();
  }

  async finishRefresh() {
    if (this.refreshEvent) {
      this.refreshEvent.target.complete();
      this.refreshEvent = null;
    }
  }

  async presentCompltedItemActionSheet(recordID) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.getRecord(recordID);
          }
        }, {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.presentDeleteRecordAlert(recordID);
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();
  }
}
