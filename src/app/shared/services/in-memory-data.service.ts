import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

import claimsJson from '@app/shared/mock/claim-list.json';
import claimTypesJson from '@app/shared/mock/claim-types.json';
import employeesJson from '@app/shared/mock/employee.json';

import { Employee } from '@app/shared/interfaces/employee.interface';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const claims = JSON.parse(JSON.stringify(claimsJson));
    const claimTypes = JSON.parse(JSON.stringify(claimTypesJson));
    const employees = JSON.parse(JSON.stringify(employeesJson));

    return {
      claims,
      claimTypes,
      employees: employees.map((employee: Employee) => ({ ...employee, id: employee._id }))
    };
  }

  genId<T>(myTable: T[]): string {
    return crypto.randomUUID();
  }
}