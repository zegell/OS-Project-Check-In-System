import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
  name: 'gpsDirection',
  standalone: true
})

export class GpsDirectionPipe implements PipeTransform {
  transform(value: number, type: 'lat' | 'lng'): string {
    if (value === null || value === undefined) return '';

    const absValue = Math.abs(value).toFixed(4);

    if (type === 'lat') {
      return value >= 0 ? `${absValue}° N` : `${absValue}° S`;
    }
    else {
      return value >= 0 ? `${absValue}° E` : `${absValue}° W`;
    }
  }
}