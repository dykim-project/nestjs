import { HttpException } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common/enums";

export class ForbiddenException extends HttpException {
    constructor() {
      super('Forbidden', HttpStatus.FORBIDDEN);
    }
}