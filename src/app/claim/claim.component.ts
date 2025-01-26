import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ClaimTableComponent } from './claim-table/claim-table.component';
import { ClaimFormComponent } from './claim-form/claim-form.component';
import { Claim } from '@app/shared/interfaces/claim.interface';

@Component({
  selector: 'app-claim-management',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ClaimTableComponent,
    ClaimFormComponent
  ],
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss'],
})
export class ClaimComponent {
  @ViewChild(ClaimFormComponent) claimFormComponent!: ClaimFormComponent;
  @ViewChild(ClaimTableComponent) claimTableComponent!: ClaimTableComponent;

  selectedClaim?: Claim | null = null;

  openClaimForm(item?: Claim) {
    if (item) this.selectedClaim = item;

    this.claimFormComponent.showDialog();
  }

  updateClaimTable() {
    this.claimTableComponent.getData();
  }
}
