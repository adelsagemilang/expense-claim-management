import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AbstractControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "form-label",
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <label [for]="for">
      <ng-content></ng-content>
      <span *ngIf="required" class='text-red-600 ml-1'>&ast;</span>
    </label>`,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class FormLabelComponent {
  @Input() for!: string;
  @Input() formControl?: AbstractControl;
  @Input() formGroup?: FormGroup;

  constructor() {}

  get required(): boolean {
    if (this.formGroup) return this.formGroup.get(this.for)?.hasValidator(Validators.required) ?? false;

    return this.formControl?.hasValidator(Validators.required) ?? false;
  }
}