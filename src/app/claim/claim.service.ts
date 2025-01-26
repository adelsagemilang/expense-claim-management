import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ClaimResDto, CreateClaimReqDto, UpdateClaimReqDto } from '@app/shared/dtos/claim.dto';
import { Claim, ClaimType } from '@app/shared/interfaces/claim.interface';
import { Employee } from '@app/shared/interfaces/employee.interface';
import { handleError } from '@app/shared/helpers';

const MEALS = 'Meals';
const TRAVEL_ALLOWANCE = 'Travel Allowance';

@Injectable({ providedIn: 'root'})
export class ClaimService {
  private claimsUrl = 'api/claims';
  private claimTypesUrl = 'api/claimTypes';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  getClaimList(): Observable<Claim[]> {
    return this.http.get<ClaimResDto[]>(this.claimsUrl).pipe(
      map(claims => claims.map(claim => {
          // Get employee and claim type details for each claim
          const employee$ = this.http.get<Employee>(`api/employees/${claim.employeeId}`);
          const claimType$ = this.getClaimType(claim.claimTypeId);
          
          return forkJoin({ employee: employee$, claimType: claimType$ }).pipe(
            map(({ employee, claimType }) => ({
              ...claim,
              employee,
              claimType
            }))
          );
      })),
      switchMap(claimsWithDetails$ => forkJoin(claimsWithDetails$)),
      catchError(handleError<Claim[]>('getClaimList', []))
    );
  }

  createClaim(data: CreateClaimReqDto): Observable<CreateClaimReqDto> {
    return this.http.post<CreateClaimReqDto>(this.claimsUrl, data, this.httpOptions).pipe(
      catchError(handleError<CreateClaimReqDto>('createClaim'))
    );
  }

  updateClaim(data: UpdateClaimReqDto): Observable<UpdateClaimReqDto> {
    return this.http.put<UpdateClaimReqDto>(this.claimsUrl, data, this.httpOptions).pipe(
      catchError(handleError<UpdateClaimReqDto>(`updateClaim id=${data.id}`))
    );
  }

  deleteClaim(id: string): Observable<{}> {
    const url = `${this.claimsUrl}/${id}`;
    return this.http.delete(url, this.httpOptions).pipe(
      catchError(handleError<{}>(`deleteClaim id=${id}`))
    );
  }

  getClaimType(id: string): Observable<ClaimType> {
    const url = `${this.claimTypesUrl}/${id}`;
    return this.http.get<ClaimType>(url).pipe(
      catchError(handleError<ClaimType>(`getClaimType id=${id}`))
    );
  }

  getClaimTypes(): Observable<ClaimType[]> {
    return this.http.get<ClaimType[]>(this.claimTypesUrl)
      .pipe(
        catchError(handleError<ClaimType[]>('getClaimTypes', []))
      );
  }

  isClaimTypeMeals(name: string): boolean {
    return name === MEALS;
  }

  isClaimTypeTravelAllowance(name: string): boolean {
    return name === TRAVEL_ALLOWANCE;
  }
};