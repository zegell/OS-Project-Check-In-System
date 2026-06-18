import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth-service/auth-service";

export const authRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  if (user) {
    const expectedRole = route.data['role'];
    if (expectedRole && user.user_type !== expectedRole) {
      router.navigate(['/login']);
      return false
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
}