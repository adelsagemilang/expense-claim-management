import { CustomFieldWithValue } from "@app/shared/interfaces/claim.interface";

// Expected payload for creating a claim via the API
export interface CreateClaimReqDto {
  employeeId: string;
  reportName: string;
  claimTypeId: string;
  attachments: File[];
  transactAt?: Date;
  startDate?: Date;
  endDate?: Date;
  numberOfDays?: number;
  claimAmount: number;
  customFields: CustomFieldWithValue[];
}

// Expected payload for updating a claim via the API
export interface UpdateClaimReqDto extends CreateClaimReqDto {
  id: string;
}

// Expected response data after creating or updating a claim via the API
// And the data used to display a list of claims
export interface ClaimResDto {
  id: string;
  employeeId: string;
  reportName: string;
  claimTypeId: string;
  attachments: File[];
  transactAt?: Date;
  startDate?: Date;
  endDate?: Date;
  numberOfDays?: number;
  claimAmount: number;
  customFields: CustomFieldWithValue[];
}