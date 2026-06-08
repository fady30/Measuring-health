import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class XssSanitizerPipe implements PipeTransform {
    transform(value: any, _metadata: ArgumentMetadata) {
        if (typeof value === 'string') {
            return this.sanitize(value);
        }

        if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                if (typeof value[key] === 'string') {
                    value[key] = this.sanitize(value[key]);
                }
            }
        }

        return value;
    }

    private sanitize(str: string): string {
        return str
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/on\w+="[^"]*"/gim, "")
            .replace(/javascript:/gim, "");
    }
}