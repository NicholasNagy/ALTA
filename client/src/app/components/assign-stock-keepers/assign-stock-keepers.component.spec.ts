import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignStockKeepersComponent } from './assign-stock-keepers.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ManageMembersService } from 'src/app/services/manage-members.service';
import { ManageAuditsService } from 'src/app/services/manage-audits.service';
import { FormBuilder } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

describe('AssignStockKeepersComponent', () => {
  let component: AssignStockKeepersComponent;
  let fixture: ComponentFixture<AssignStockKeepersComponent>;
  let service: ManageMembersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignStockKeepersComponent],
      providers: [
        FormBuilder,
        { provide: ManageMembersService },
        { provide: ManageAuditsService }
      ],
      imports: [HttpClientModule, RouterTestingModule, MatDialogModule ],
    });

    fixture = TestBed.createComponent(AssignStockKeepersComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ManageMembersService);
    fixture.detectChanges();
  });

  it('should create Assign Stock-Keepers Component', () => {
    expect(component).toBeTruthy();
  });
});