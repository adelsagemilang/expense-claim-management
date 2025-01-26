import { ClaimResDto } from "../dtos/claim.dto";
import { Employee } from "./employee.interface";

export enum CustomFieldType {
  Text = "TEXT",
  Number = "NUMBER",
}

export interface CustomField {
  isMandatory: boolean;
  key: string;
  label: string;
  type: CustomFieldType;
}

export interface CustomFieldWithValue extends CustomField {
  value: string | number;
}

export interface ClaimType {
  id: string;
  name: string;
  customFields: CustomField[];
}

export interface Claim extends ClaimResDto {
  employee: Employee | undefined;
  claimType: ClaimType | undefined;
}
