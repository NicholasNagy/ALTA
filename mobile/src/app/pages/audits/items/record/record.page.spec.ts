import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecordPage } from './record.page';

describe('RecordPage', () => {
  let component: RecordPage;
  let fixture: ComponentFixture<RecordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordPage ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers : [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
