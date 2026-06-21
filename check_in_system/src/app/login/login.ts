import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth-service/auth-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {username: '', password: ''};
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  submitLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        if (user.user_type === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        }
        else if (user.user_type === 'USER') {
          this.router.navigate(['']);
        }
        else {
          this.errorMessage = 'Unknown user role';
          this.authService.logout();
        }
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}