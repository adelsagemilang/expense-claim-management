import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { ToastModule } from 'primeng/toast';
import { MessageService } from "primeng/api";
import { Component, Host, Input, OnInit, Optional, SkipSelf } from "@angular/core";
import { ControlContainer, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, ControlValueAccessor } from "@angular/forms";

@Component({
  selector: "form-input-file",
  host: {'class': 'form-input-file'},
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    ToastModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FormInputFile,
      multi: true
    },
    MessageService
  ],
  template: `
      <p-toast></p-toast>
      <div class="grid gap-2 m-0">
        <ng-container *ngFor="let file of files; let i = index">
          <div class="flex align-items-center justify-content-between w-full pl-3 border-round-md border-1 border-400">
            {{ file.name }}
            <p-button icon="pi pi-times" [text]="true" size="small" (click)="removeFile(i)"></p-button>
          </div>
        </ng-container>

        <button type="button" class="flex align-items-center justify-content-center text-green-600" (click)="fileInput.click()">
          <input #fileInput type="file" multiple="multiple" class="hidden" accept="image/png, image/jpeg, application/pdf"  (change)="onFileChange($event)" />
          <ng-content></ng-content>
        </button>

        <span class="text-400 text-xs">Supported file type .png/.jpg/.pdf</span>
      </div>
    `,
  styles: [
    `
      :host {
        button {
          cursor: pointer;
          background-color: transparent;
          padding: 8px;
          text-align: center;
          width: 100%;
          border-radius: 6px;
          border-color: var(--black-400);
          box-shadow: none;
          border-width: 1px;
          border-style: dashed;
          font-weight: 500;
        }

        ::ng-deep {
          .p-button-text:hover {
            background-color: unset;
          }

          .pi-times  {
            color: var(--red-500);
          }
        }
      }
    `
  ],
})
export class FormInputFile implements ControlValueAccessor, OnInit {
  @Input() formControlName!: string;

  control!: FormControl;
  files: File[] = [];

  constructor (
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer,
    private messageService: MessageService
  ) {
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit () {
    this.validateFormControl();
    this.checkInitialValue();
  }

  checkInitialValue () {
    if (this.control) {
      this.files = this.control.value;
    }
  }

  validateFormControl() {
    if (this.controlContainer) {
      if (this.formControlName) {
        this.control = this.controlContainer.control?.get(this.formControlName) as FormControl;
      } else {
        console.warn('Missing FormControlName directive from host element of the component');
      }
    } else {
      console.warn('Can\'t find parent FormGroup directive');
    }
  }


  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target && target.files && target.files.length > 0) {
      const fileType = target.files[0].type;
      
      const isValid = ['image/png', 'image/jpeg', 'application/pdf'].includes(fileType);

      if (!isValid) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid file type' });
        return;
      } else {
        this.files = Array.from(target.files);
        this.controlContainer.control?.get(this.formControlName)?.setValue(this.files);
      }
    }
  }

  removeFile (index: number) {
    this.files.splice(index, 1);
    this.controlContainer.control?.get(this.formControlName)?.setValue(this.files);
  }
}