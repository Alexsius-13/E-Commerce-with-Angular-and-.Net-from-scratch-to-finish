import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.currentUserSource$.pipe(
    map(auth => {
      if(auth){
        return true;
      }
      else{
        router.navigate(['/account/login'], {queryParams: {returnUrl: router.url}});
        return false;
      }
    })
  )
};
