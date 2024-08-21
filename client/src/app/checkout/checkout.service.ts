import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DeliveryMethod } from '../shared/models/deliveryMethod';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  baseApiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  getDeliveryMerhods() {
    return this.http.get<DeliveryMethod[]>(this.baseApiUrl + 'orders/deliveryMethods').pipe(
      map(dm => {
        return dm.sort((a, b) => b.price - a.price)
      })
    )
  }
}
