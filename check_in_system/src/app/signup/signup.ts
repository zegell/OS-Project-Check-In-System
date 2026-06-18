import { Component } from '@angular/core';
import { AuthService } from '../auth-service/auth-service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  errorMessage = '';
  constructor(private authService: AuthService, private router: Router) {}
  
  submitRegister(form: NgForm) {
    this.errorMessage = '';

    if (form.invalid || form.value.password !== form.value.confirmPassword) {
      this.errorMessage = 'Password mismatch';
      return;
    }

    const credentials = {
      username : form.value.username,
      password: form.value.password
    };

    this.authService.signup(credentials).subscribe({
      next: (response) => {
        alert(response.message || 'Sign Up Successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'An error occurred';
      }
    });
  }
}
