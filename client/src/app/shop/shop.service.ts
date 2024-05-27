import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pagination } from '../shared/models/pagination';
import { Product } from '../shared/models/product';
import { Brand } from '../shared/models/brand';
import { Type } from '../shared/models/type';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseApiUrl = 'https://localhost:5001/api/'


  constructor(private http: HttpClient) { }

  getProducts(brandId?: number, typeId?: number){
    let params = new HttpParams();
    
    if(brandId) params = params.append('brandId', brandId);
    if(typeId) params = params.append('typeId', typeId);

    return this.http.get<Pagination<Product[]>>(this.baseApiUrl + 'products', {params});
  }

  getBrands(){
    return this.http.get<Brand[]>(this.baseApiUrl + 'products/brands');
  }

  getTypes(){
    return this.http.get<Type[]>(this.baseApiUrl + 'products/types');
  }
}
