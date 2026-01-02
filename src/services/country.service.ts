
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  countries = [
    "International", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "China", "Japan",
    "Brazil", "Mexico", "Italy", "Spain", "Netherlands", "Switzerland", "Sweden", "Poland", "Belgium", "Austria",
    "Norway", "Ireland", "Denmark", "Singapore", "New Zealand", "Finland", "Portugal", "Greece", "South Africa",
    "Russia", "Turkey", "Saudi Arabia", "United Arab Emirates", "Argentina", "Chile", "Colombia", "Egypt",
    "Indonesia", "Malaysia", "Philippines", "Thailand", "Vietnam"
  ].sort();

  selectedCountry = signal<string>('International');

  constructor() {
    this.detectCountry();
  }

  async detectCountry() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const detected = this.countries.find(c => c.toLowerCase() === data.country_name?.toLowerCase());
        if (detected) {
          this.selectedCountry.set(detected);
        }
      }
    } catch (e) {
      console.warn('Could not auto-detect country, defaulting to International');
    }
  }
}
