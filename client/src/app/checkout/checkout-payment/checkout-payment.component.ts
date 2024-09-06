import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasketService } from 'src/app/basket/basket.service';
import { CheckoutService } from '../checkout.service';
import { ToastrService } from 'ngx-toastr';
import { Basket } from 'src/app/shared/models/basket';
import { Address } from 'src/app/shared/models/user';
import { NavigationExtras, Router } from '@angular/router';
import { loadStripe, Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement,  StripeElementChangeEvent } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { OrderToCreate } from 'src/app/shared/models/order';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit {
  @Input() checkoutForm?: FormGroup;
  @ViewChild('cardNumber') cardNumberElement?:  ElementRef;
  @ViewChild('cardExpiry') cardExpiryElement?:  ElementRef;
  @ViewChild('cardCvc') cardCvcElement?:  ElementRef;
  stripe: Stripe | null = null;
  cardNumber?: StripeCardNumberElement;
  cardExpiry?: StripeCardExpiryElement;
  cardCvc?: StripeCardCvcElement;
  cardNumberComplete = false;
  cardExpirtComplete = false;
  cardCvComplete = false;
  cardErrors: any;
  loading = false;

  constructor(private basketService: BasketService, private checkoutService: CheckoutService,
      private toastr: ToastrService, private router: Router
  ) {}
  
  
  ngOnInit(): void {
    loadStripe('pk_test_51PsQpMGxNY4ThISYxDf8E7ik9IXl99WxklYuYKIlQvHDwzHT47LZ1lGOo8tCw8Dd2e17hQF9fhRweYMoqxQfmNAa00laajqblK').then(stripe => {
      this.stripe = stripe;
      const elements = stripe?.elements();
      if(elements) {
        this.cardNumber = elements.create('cardNumber');
        this.cardNumber.mount(this.cardNumberElement?.nativeElement);
        this.cardNumber.on('change', (event: StripeElementChangeEvent) => {
          this.cardNumberComplete = event.complete;
          if (event.error) this.cardErrors = event.error.message;
          else this.cardErrors = null;
        });
        
        this.cardExpiry = elements.create('cardExpiry');
        this.cardExpiry.mount(this.cardExpiryElement?.nativeElement);
        this.cardExpiry.on('change', (event: StripeElementChangeEvent) => {
          this.cardExpirtComplete = event.complete;
          if (event.error) this.cardErrors = event.error.message;
          else this.cardErrors = null;
        });

        this.cardCvc = elements.create('cardCvc');
        this.cardCvc.mount(this.cardCvcElement?.nativeElement);
        this.cardCvc.on('change', (event: StripeElementChangeEvent) => {
          this.cardCvComplete = event.complete;
          if (event.error) this.cardErrors = event.error.message;
          else this.cardErrors = null;
        });
      }
    })
  }

  get paymentFormComplete() {
    return this.checkoutForm?.get('paymentForm')?.valid 
        && this.cardNumberComplete 
        && this.cardExpirtComplete
        && this.cardCvComplete
  }

  async submitOrder(){
    this.loading = true;
    const basket = this.basketService.getCurrentBasketValue();
    try {
      const createOrder = await this.createOrder(basket);
      const paymentResult = await this.confirmPaymentWithStripe(basket);
      if (paymentResult) {
        this.basketService.deleteLocalBasket();
        const navigationExtras: NavigationExtras = { state: createOrder };
        this.router.navigate(['checkout/success'], navigationExtras);
      }
    } catch (error: any) {
      this.toastr.error(error.message);
    } finally {
      this.loading = false;
    }
  }
  
  
  private async confirmPaymentWithStripe(basket: Basket | null) {
    if (!basket) throw new Error('Basket is null');
  
    const result = this.stripe?.confirmCardPayment(basket.clientSecret!, {
      payment_method: {
        card: this.cardNumber!,
        billing_details: {
          name: this.checkoutForm?.get('paymentForm')?.get('nameOnCard')?.value
        }
      }
    });
    if(!result) throw new Error('Payment somehow failed');
    return result;
  }


  private async createOrder(basket: Basket | null) {
    if(!basket) throw new Error('Basket is null');
    const orderToCreate = await this.getOrderToCreate(basket);
    return firstValueFrom(this.checkoutService.createOrder(orderToCreate));
  }
  
  
  private getOrderToCreate(basket: Basket) : OrderToCreate {
    const deliveryMethodId = this.checkoutForm?.get('deliveryForm')?.get('deliveryMethod')?.value;
    const shipToAddress = this.checkoutForm?.get('addressForm')?.value as Address;

    if(!deliveryMethodId || !shipToAddress) throw new Error('Problem with basket');

    return {
      basketId: basket.id,
      deliveryMethodId: deliveryMethodId,
      shipToAddress: shipToAddress
    }
  }
}
