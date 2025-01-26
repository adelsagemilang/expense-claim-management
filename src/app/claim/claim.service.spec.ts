import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimService } from './claim.service';
import { Claim, ClaimType } from '@app/shared/interfaces/claim.interface';
import { ClaimResDto, CreateClaimReqDto, UpdateClaimReqDto } from '@app/shared/dtos/claim.dto';
import { Employee } from '@app/shared/interfaces/employee.interface';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService]
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve claim list', () => {
    const dummyClaims: ClaimResDto[] = [
      { id: '1', employeeId: '1', claimTypeId: '1', claimAmount: 100, reportName: 'Report 1', attachments: [], customFields: [] },
      { id: '2', employeeId: '2', claimTypeId: '2', claimAmount: 200, reportName: 'Report 2', attachments: [], customFields: [] }
    ];

    const dummyEmployees: Employee[] = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' }
    ];

    const dummyClaimTypes: ClaimType[] = [
      { id: '1', name: 'Meals', customFields: [] },
      { id: '2', name: 'Travel Allowance', customFields: [] }
    ];

    service.getClaimList().subscribe(claims => {
      expect(claims.length).toBe(2);
      expect(claims).toEqual([
        { ...dummyClaims[0], employee: dummyEmployees[0], claimType: dummyClaimTypes[0] },
        { ...dummyClaims[1], employee: dummyEmployees[1], claimType: dummyClaimTypes[1] }
      ]);
    });

    const reqClaims = httpMock.expectOne('api/claims');
    expect(reqClaims.request.method).toBe('GET');
    reqClaims.flush(dummyClaims);

    dummyClaims.forEach((claim, index) => {
      const reqEmployee = httpMock.expectOne(`api/employees/${claim.employeeId}`);
      expect(reqEmployee.request.method).toBe('GET');
      reqEmployee.flush(dummyEmployees[index]);

      const reqClaimType = httpMock.expectOne(`api/claimTypes/${claim.claimTypeId}`);
      expect(reqClaimType.request.method).toBe('GET');
      reqClaimType.flush(dummyClaimTypes[index]);
    });
  });

  it('should create a new claim', () => {
    const newClaim: CreateClaimReqDto = { employeeId: '1', claimTypeId: '1', reportName: 'Report 1', attachments: [], customFields: [], claimAmount: 100 };

    service.createClaim(newClaim).subscribe(claim => {
      expect(claim).toEqual(newClaim);
    });

    const req = httpMock.expectOne('api/claims');
    expect(req.request.method).toBe('POST');
    req.flush(newClaim);
  });

  it('should update an existing claim', () => {
    const updatedClaim: UpdateClaimReqDto = { id: '1', employeeId: '1', claimTypeId: '1', reportName: 'Report 1', attachments: [], customFields: [], claimAmount: 150 };;

    service.updateClaim(updatedClaim).subscribe(claim => {
      expect(claim).toEqual(updatedClaim);
    });

    const req = httpMock.expectOne('api/claims');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedClaim);
  });

  it('should retrieve a claim type by id', () => {
    const dummyClaimType: ClaimType = { id: '1', name: 'Meals', customFields: [] };

    service.getClaimType('1').subscribe(claimType => {
      expect(claimType).toEqual(dummyClaimType);
    });

    const req = httpMock.expectOne('api/claimTypes/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyClaimType);
  });

  it('should retrieve all claim types', () => {
    const dummyClaimTypes: ClaimType[] = [
      { id: '1', name: 'Meals', customFields: [] },
      { id: '2', name: 'Travel Allowance', customFields: [] }
    ];

    service.getClaimTypes().subscribe(claimTypes => {
      expect(claimTypes.length).toBe(2);
      expect(claimTypes).toEqual(dummyClaimTypes);
    });

    const req = httpMock.expectOne('api/claimTypes');
    expect(req.request.method).toBe('GET');
    req.flush(dummyClaimTypes);
  });

  it('should identify claim type as Meals', () => {
    expect(service.isClaimTypeMeals('Meals')).toBeTrue();
    expect(service.isClaimTypeMeals('Travel Allowance')).toBeFalse();
  });

  it('should identify claim type as Travel Allowance', () => {
    expect(service.isClaimTypeTravelAllowance('Travel Allowance')).toBeTrue();
    expect(service.isClaimTypeTravelAllowance('Meals')).toBeFalse();
  });
});