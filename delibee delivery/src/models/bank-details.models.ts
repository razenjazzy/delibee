export class BankDetail {
  name: string;
  bank_name: string;
  account_number: string;
  ifsc: string;

  constructor(account_number:string,bank_name: string, name: string,ifsc:string) {
    this.name = name;
    this.bank_name = bank_name;
    this.account_number = account_number;
    this.ifsc = ifsc;
  }
}