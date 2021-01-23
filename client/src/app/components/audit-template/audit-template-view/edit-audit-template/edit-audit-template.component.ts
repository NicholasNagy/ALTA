import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditTemplateService } from '../../../../services/audit-template.service';
import { ActivatedRoute } from '@angular/router';
import {AuditTemplateViewComponent} from '../audit-template-view.component';


@Component({
  selector: 'app-edit-audit-template',
  templateUrl: '../audit-template-view.component.html',
  styleUrls: ['../audit-template-view.component.scss']
})
export class EditAuditTemplateComponent extends AuditTemplateViewComponent {

  id: any;
  disabled: boolean;

  constructor(
    private router: Router,
    private auditTemplateService: AuditTemplateService,
    private activatedRoute: ActivatedRoute,
  ) {
    super();
  }

  initializeForm(): void {
    this.disabled = false;
    this.templateValues = {
      location: '',
      plant: '',
      zones: '',
      aisles: '',
      bins: '',
      part_number: '',
      serial_number: '',
    };
    this.activatedRoute.params.subscribe((routeParams) => {
      this.id = routeParams.ID;
      this.auditTemplateService.getATemplate(this.id).subscribe((temp) => {
        this.setComponentParameters(this.formTemplate(temp));
        this.title = temp.title;
        this.description = temp.description;
        this.id = temp.template_id;
      });
    });
  }

  formTemplate(temp): any {
    const createdTemplate: any = {};
    Object.entries(temp).forEach(([key, value]) => {
      if (typeof key === 'string' && typeof value === 'string'
        // checks to make sure that it is only adding keys from the template interface
        && this.templateValues.hasOwnProperty(key)) {
        createdTemplate[key] = JSON.parse(value.replace(/'/g, '"')); // replace to fix crash on single quote
      }
    });
    return createdTemplate;
  }

  setComponentParameters(body): void {
    if (body) {
      this.disabled = true;
      this.template = body;
    } else {
      this.disabled = false;
    }
  }

  beginEdit(): void {
    this.disabled = false;
  }

  submitQuery(body): void {
    body["template_id"] = this.id;
    this.auditTemplateService.updateTemplate(this.id, body).subscribe(
      () => {
        setTimeout(() => {
          // Redirect user back to list of templates
          window.location.reload();
        }, 1000); // Waiting 1 second before redirecting the user
        this.setComponentParameters(false);
        this.errorMessage = '';

      },
      (err) => {
        // if backend returns an error
        if (err.error) {
          this.errorMessage = err.error;
        }
      }
    );
  }
}