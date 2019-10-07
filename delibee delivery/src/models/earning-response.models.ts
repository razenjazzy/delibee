import { BaseListResponse } from "./base-list.models";

export class EarningResponse {
  total_earnings: number;
  earnings: BaseListResponse;
  last_earning_date: string;
}