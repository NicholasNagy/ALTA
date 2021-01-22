import {Router} from '@angular/router';
import {AuditTemplateService} from '../../services/audit-template.service';
import {OnInit} from '@angular/core';
import {Template} from './Template';

export abstract class AuditTemplateViewComponent implements OnInit {

  template: Template = {
    location: [],
    plant: [],
    zones: [],
    aisles: [],
    bins: [],
    part_number: [],
    serial_number: [],
  };
  templateValues: Template;

  protected constructor(
    router: Router,
    auditTemplateService: AuditTemplateService,
  ) {  }

  ngOnInit(): void {
    this.initializeForm();
  }

  addItem(term, value): void {
    // although not obvious, the includes statement here is also necessary for the proper functionality of the remove function
    if (value !== '' && !this.template[term].includes(value)) {
      this.template[term].push(value);
      this.templateValues[term] = '';
    }
  }

  abstract initializeForm(): void;

}
