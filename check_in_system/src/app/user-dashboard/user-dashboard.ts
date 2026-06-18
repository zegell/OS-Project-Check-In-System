import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CheckInFetchService, CheckInLog } from '../check-in-fetch-service/check-in-fetch-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GpsDirectionPipe } from '../gps-direction/gps-direction';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ CommonModule, GpsDirectionPipe],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit{
  private router = inject(Router);
  private checkInService = inject(CheckInFetchService);
  public username = signal<string>('User');
  public checkInLogs = signal<CheckInLog[]>([]);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      try {
        const userObj = JSON.parse(currentUserData);

        if (userObj.username) {
          this.username.set(userObj.username);
        }

        if (userObj.user_id) {
          const userIdNum = parseInt(userObj.user_id, 10);
          this.loadHistory(userIdNum);
          this.checkInService.fetchLiveProfile(userIdNum).subscribe({
            next: (liveUser) => {
              if (liveUser.user_type !== userObj.user_type) {
                console.log('User Type Mismatch');
                userObj.user_type = liveUser.user_type;
                localStorage.setItem('currentUser', JSON.stringify(userObj));

                if (liveUser.user_type !== 'ADMIN') {
                  alert('User type changed. Redirecting...');
                  this.router.navigate(['/login']);
                }
              }
            },
            error: (err) => {
              console.error('Silent session token sync skipped: ', err);
            }
          });
        }
        else {
          this.errorMessage.set('Invalid User ID');
        }
      }
      catch (error) {
        console.error('Error parsing currentUser JSON: ', error);
        this.errorMessage.set('Session Data Error. Please Log In Again');
      }
    }
    else {
      this.errorMessage.set('No active log in session found');
    }
  }

  loadHistory(userId: number): void {
    this.checkInService.getCheckInHistory(userId).subscribe({
      next: (data) => {
        this.checkInLogs.set(data);
      },
      error: (err) => {
        console.error('History Compile Failure: ', err);
        this.errorMessage.set('Failed to retrieve data');
      }
    });
  }

  public personalTotalCheckIn = computed(() => this.checkInLogs().length);

  public logOut(): void {
    localStorage.removeItem('currentUser');
    localStorage.clear();
    this.router.navigate(['/login'])
  }


}
