import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { InMemoryDataService } from '@app/shared/services/in-memory-data.service';

// Claim Management
import { ClaimComponent } from '@app/claim/claim.component';
import { ClaimService } from '@app/claim/claim.service';

import { EmployeeService } from '@app/employee/employee.service';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService,
      { dataEncapsulation: false }
    ),
    ClaimComponent,
  ],
  providers: [
    ClaimService,
    EmployeeService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
