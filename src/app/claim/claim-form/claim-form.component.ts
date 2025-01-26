import { Component, computed, WritableSignal, signal, Signal, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { EmployeeService } from '@app/employee/employee.service';
import { Employee } from '@app/shared/interfaces/employee.interface';

import { ClaimService } from '@app/claim/claim.service';
import { Claim, ClaimType, CustomFieldWithValue } from '@app/shared/interfaces/claim.interface';

import { FormLabelComponent } from '@app/shared/components/form-label.component';
import { FormInputFile } from '@app/shared/components/form-input-file.component';
import { CreateClaimReqDto } from '@app/shared/dtos/claim.dto';
import { countOfDays } from '@app/shared/helpers';

@Component({
  selector: 'claim-form',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ReactiveFormsModule,
    FormLabelComponent,
    FormInputFile
  ],
  templateUrl: './claim-form.component.html',
  styleUrls: ['./claim-form.component.scss'],
  providers: [MessageService]
})
export class ClaimFormComponent {
  @Input() claim?: Claim | null = null;
  @Output() onUpdate = new EventEmitter();

  AMOUNT_PER_DAY = 120;

  isOpenModal: boolean = false;
  isEdit: boolean = false;
  employees: Employee[] = [];
  claimTypes: ClaimType[] = [];
  customFields: CustomFieldWithValue[] = [];

  form: FormGroup = new FormGroup({
    employee: new FormControl<Employee | null>(null, {
      validators: Validators.required,
    }),
    reportName: new FormControl<string>('', {
      validators: Validators.required
    }),
    claimType: new FormControl<ClaimType | null>(null, {
      validators: Validators.required
    }),
    attachments: new FormControl<File[]>([], {
      validators: Validators.required
    }),
    totalAmount: new FormControl<number | null>(null, {
      validators: Validators.required
    })
  });

  claimTypeSignal: WritableSignal<ClaimType | null> = signal(this.form.get('claimType')?.value);
  startDateSignal: WritableSignal<Date | null> = signal(this.form.get('startDate')?.value);

  isClaimTypeMeals: Signal<boolean> = computed(() => this.claimService.isClaimTypeMeals(this.claimTypeSignal()?.name ?? ''));
  isClaimTypeTravelAllowance: Signal<boolean> = computed(() => this.claimService.isClaimTypeTravelAllowance(this.claimTypeSignal()?.name ?? ''));
  
  minEndDate: Signal<Date> = computed(() => {
    const startDate = this.startDateSignal();

    const minDate = new Date(startDate!);
    minDate.setDate(minDate.getDate() + 1);

    return minDate;
  });

  constructor(
    private employeeService: EmployeeService,
    private claimService: ClaimService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getEmployees();
    this.getClaimTypes();

    this.form.get('claimType')?.valueChanges.subscribe(value => {
      this.onClaimTypeChange(value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['claim']) {
      this.isEdit = !!this.claim
      if (this.isEdit) this.initForm();
    }

  }

  getEmployees() {
    this.employeeService.getEmployees()
    .subscribe(employees => {
      this.employees = employees;
    });
  }

  getClaimTypes() {
    this.claimService.getClaimTypes()
    .subscribe(claimTypes => {
      this.claimTypes = claimTypes;
    });
  }

  showDialog() {
    this.isOpenModal = true;
  }

  closeDialog() {
    this.isOpenModal = false;
    this.form.reset();
    console.log(this.form.value)
  }

  initForm() {
    this.form.patchValue({
      employee: this.claim?.employee,
      reportName: this.claim?.reportName,
      claimType: this.claim?.claimType,
      attachments: this.claim?.attachments,
      totalAmount: this.claim?.claimAmount
    });

    if (this.claim?.attachments?.length) {
      this.form.get('attachments')?.setValue(this.claim.attachments);
    }

    if (this.claim?.claimType) {
      this.initMealsForm(this.claim.claimType);
      this.initTravelAllowanceForm(this.claim.claimType);
      this.setCustomFields(this.claim.customFields);
    }
  }

  initMealsForm(value: ClaimType) {
    if (this.claimService.isClaimTypeMeals(value.name)) {
      this.form.addControl('transactionDate', new FormControl<Date | null>(null, {
        validators: Validators.required
      }))

      if (this.claim) {
        this.form.get('transactionDate')?.setValue(new Date(this.claim?.transactAt ?? ''));
      }
    }
  }

  initTravelAllowanceForm(value: ClaimType) {
    if (this.claimService.isClaimTypeTravelAllowance(value.name)) {
      this.form.addControl('startDate', new FormControl<Date | null>(null, {
        validators: Validators.required
      }))
      this.form.addControl('endDate', new FormControl<Date | null>(null, {
        validators: Validators.required
      }))
      this.form.addControl('numberOfDays', new FormControl<number | null>(null, {
        validators: Validators.required
      }))

      // disable numberOfDays and totalAmount as it was readonly
      this.form.get('numberOfDays')?.disable();
      this.form.get('totalAmount')?.disable();

      // disable endDate initially for validation purpose
      this.form.get('endDate')?.disable();

      // observe startDate
      this.form.get('startDate')?.valueChanges.subscribe(value => {
        this.startDateSignal.set(value);
        this.form.get('endDate')?.enable();
      })

      // observe endDate
      this.form.get('endDate')?.valueChanges.subscribe(value => {
        const startDate = this.startDateSignal();
        if (startDate && value) {
          const daysCount = countOfDays(startDate, value);

          this.form.get('numberOfDays')?.setValue(daysCount);

          const formula = daysCount * this.AMOUNT_PER_DAY;
          this.form.get('totalAmount')?.setValue(formula);
        }
      })
    }
  }

  setCustomFields(customFields: CustomFieldWithValue[]) {
    if (customFields.length > 0) {
      this.customFields = [...customFields];

      customFields.forEach(field => {
        const DEFAULT_VALUE_TYPE = {
          TEXT: '',
          NUMBER: null
        }

        this.form.addControl(field.key, new FormControl(DEFAULT_VALUE_TYPE[field.type]));

        if (field.isMandatory) this.form.get(field.key)?.setValidators(Validators.required);

        if (field.value) this.form.get(field.key)?.setValue(field.value);
      })
    }
  }

  onClaimTypeChange(value: ClaimType) {
    if (!value) return

    this.claimTypeSignal.set(value)

    this.initMealsForm(value);
    this.initTravelAllowanceForm(value);
    
    this.setCustomFields(value.customFields as CustomFieldWithValue[])

  }
  
  submit() {
    if (!this.form.valid) return
    
    const body: CreateClaimReqDto = {
      employeeId: this.form.get('employee')?.value.id,
      reportName: this.form.get('reportName')?.value,
      claimTypeId: this.form.get('claimType')?.value.id,
      attachments: this.form.get('attachments')?.value,
      claimAmount: this.form.get('totalAmount')?.value,
      customFields: this.customFields.map(field => {
        return {
          isMandatory: field.isMandatory,
          key: field.key,
          label: field.label,
          type: field.type,
          value: this.form.get(field.key)?.value
        }
      })
    }

    if (this.isClaimTypeMeals()) body.transactAt = this.form.get('transactionDate')?.value;
    
    if (this.isClaimTypeTravelAllowance()) {
      body.startDate = this.form.get('startDate')?.value;
      body.endDate = this.form.get('endDate')?.value;
      body.numberOfDays = this.form.get('numberOfDays')?.value;
    }

    try {
      const action = this.isEdit 
        ? this.claimService.updateClaim({ id: this.claim!.id, ...body })
        : this.claimService.createClaim(body);
      
      action.subscribe(() => {
        const msgType = this.isEdit ? 'updated' : 'created';
        
        this.messageService.add({severity: 'success', summary: 'Success', detail: `Claim ${msgType} successfully.`});
        this.onUpdate.emit()
      });
    } finally {
      this.closeDialog()
    }
  }
}
