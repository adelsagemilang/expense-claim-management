import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClaimComponent } from './claim/claim.component';

const routes: Routes = [
  {
    path: '',
    component: ClaimComponent,
    title: 'Claim Management'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
