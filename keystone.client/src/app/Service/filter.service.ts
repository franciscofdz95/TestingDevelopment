import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FilterOption {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private get baseUrl(): string {
    return environment.apiUrl || environment.hostApi || '';
  }

  constructor(private http: HttpClient) { }

  getAccountingYears(): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`${this.baseUrl}/api/Filter/AcctYear`);
  }

  getAccountingMonths(): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`${this.baseUrl}/api/Filter/AcctMonth`);
  }

  getDisplayCurrencies(locationCode: string = '', countryCode: string = ''): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`${this.baseUrl}/api/Filter/DisplayCurrency?locationCode=${locationCode}&countryCode=${countryCode}`);
  }

  getLocationTypes(): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`${this.baseUrl}/api/Filter/LocType`);
  }

  getLocationCodes(geoCode: string = '', geoId: string = '', locationCode: string = ''): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`${this.baseUrl}/api/Filter/LocationCode?geoCode=${geoCode}&geoId=${geoId}&locationCode=${locationCode}`);
  }

  getServiceCodes(): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`${this.baseUrl}/api/Filter/ServiceCode`);
  }
}
