export class SupportRequest {
    name: string;
    email: string;
    message: string;

    constructor(message:string,email: string, name: string) {
      this.name = name;
      this.email = email;
      this.message = message;
    }
}