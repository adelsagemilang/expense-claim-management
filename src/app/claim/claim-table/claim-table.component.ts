import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';


import { Claim, ClaimType } from '@app/shared/interfaces/claim.interface';
import { ClaimService } from '@app/claim/claim.service';
import { SortEvent } from 'primeng/api';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'claim-table',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PanelModule,
    TableModule,
    ToastModule,
    ConfirmPopupModule,
    InputTextModule
  ],
  templateUrl: './claim-table.component.html',
  styleUrls: ['./claim-table.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ClaimTableComponent {
  @Output() onUpdate = new EventEmitter<Claim>();

  claims!: Claim[];
  columns!: Column[];
  claimTypes: ClaimType[] = [];

  constructor(
    private claimService: ClaimService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getData();
    this.getClaimTypes();

    this.columns = [
      { field: 'reportName', header: 'Report' },
      { field: 'claimItem', header: 'Claim Item' },
      { field: 'from', header: 'From' },
      { field: 'claimAmount', header: 'Amount' },
      { field: 'action', header: 'Action' },
    ];
  }

  getData() {
    this.claimService.getClaimList()
    .subscribe(claims => {
      this.claims = claims;
    });
  }

  getClaimTypes() {
    this.claimService.getClaimTypes()
    .subscribe(claimTypes => {
      this.claimTypes = claimTypes;
    });
  }

  handleSearch(claimTable: Table, e: Event) {
    const input = e.target as HTMLInputElement;
    claimTable.filterGlobal(input?.value, 'contains')
  }

  handleSort(event: SortEvent) {
    if (event.data) {
      event.data.sort((a, b) => {
        let result = 0;
        if (event.field === 'reportName') {
          result = a.reportName.localeCompare(b.reportName);
        } else if (event.field === 'claimItem' && a.claimType && b.claimType) {
          result = a.claimType.name.localeCompare(b.claimType.name);
        } else if (event.field === 'from' && a.employee && b.employee) {
          result = a.employee.name.localeCompare(b.employee.name);
        } else if (event.field === 'claimAmount') {
          result = a.claimAmount - b.claimAmount;
        }

        return (event.order ?? 0) * result;
      });
    }
  }

  onConfirmDelete(event: Event, claim: Claim) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to delete this claim?',
      icon: 'pi pi-exclamation-triangle text-red-600',
      accept: () => this.onDelete(claim),
      reject: () => this.confirmationService.close()
    });
  }

  onDelete(claim: Claim) {
    this.claimService.deleteClaim(claim.id).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Success delete claim report' });
      this.getData();
    });
  }
}
