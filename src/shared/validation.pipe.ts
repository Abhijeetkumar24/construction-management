import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {          // value: The data that is being processed by the pipe.   ,metatype: The metadata describing the type of the data.

        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToInstance(metatype, value);          // plainToInstance function from the class-transformer library is used to convert the plain JavaScript object (value) into an instance of the class represented by metatype.
        const errors = await validate(object);
        if (errors.length > 0) {
            const errorMessages = errors.map(error => {
                const constraints = error.constraints;
                const property = error.property;

                return {
                    property,
                    constraints
                };
            });
            throw new BadRequestException({
                message: 'Validation failed',
                errors: errorMessages
            });
        }
        return value;
    }

    private toValidate(metatype: Function): boolean {                         // checks whether the metatype is one of the basic JavaScript types (String, Boolean, Number, Array, Object) or not. 
        const types: Function[] = [String, Boolean, Number, Array, Object];           
        return !types.includes(metatype);
    }
}
