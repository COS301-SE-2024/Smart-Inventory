import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
  standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number, currencyCode: string = 'ZAR'): string {
    const formattedValue = value.toFixed(2);
    switch (currencyCode) {
      case 'ZAR':
        return `R ${formattedValue}`;
      case 'USD':
        return `$ ${formattedValue}`;
      case 'EUR':
        return `€ ${formattedValue}`;
      case 'GBP':
        return `£ ${formattedValue}`;
      default:
        return `${currencyCode} ${formattedValue}`;
    }
  }
}