import { Component, inject, OnInit, signal, computed, OnDestroy, effect } from '@angular/core';
import { CheckInFetchService, CheckInLog } from '../check-in-fetch-service/check-in-fetch-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GpsDirectionPipe } from '../gps-direction/gps-direction';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ CommonModule, GpsDirectionPipe],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private checkInService = inject(CheckInFetchService);
  public username = signal<string>('User');
  public checkInLogs = this.checkInService.checkInLogs;
  public errorMessage = signal<string | null>(null);
  public currentPage = signal<number>(1);
  public pageSize = 10;
  private sanitiser = inject(DomSanitizer);
  public mapEmbedUrl = signal<SafeResourceUrl | null>(null);

  constructor() {
    effect(() => {
      const maxPages = this.totalPages();
      if (this.currentPage() > maxPages) {
        this.currentPage.set(maxPages);
      }
    });
  }

  public totalPages = computed(()=> {
    const totalItem = this.checkInLogs().length;
    return totalItem === 0 ? 1 : Math.ceil(totalItem / this.pageSize);
  });

  public pagedCheckInLogs = computed(()=> {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.checkInLogs().slice(startIndex, endIndex);
  });

  onRowClick(latitude: number, longitude: number): void {
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
    this.mapEmbedUrl.set(this.sanitiser.bypassSecurityTrustResourceUrl(url));
  }

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
          this.checkInService.startAdminPolling(userIdNum, 1, 1);
          this.checkInService.fetchLiveProfile(userIdNum).subscribe({
            next: (liveUser) => {
              if (liveUser.user_type !== userObj.user_type) {
                console.log('User Type Mismatch');
                userObj.user_type = liveUser.user_type;
                localStorage.setItem('currentUser', JSON.stringify(userObj));

                if (liveUser.user_type !== 'USER') {
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

  ngOnDestroy(): void {
    this.checkInService.stopAdminPolling();
  }

  public changePage(step: number): void {
    const targetPage = this.currentPage() + step;
    if (targetPage >= 1 && targetPage <= this.totalPages()) {
      this.currentPage.set(targetPage);
    }
  }

  public personalTotalCheckIn = computed(() => this.checkInLogs().length);

  public logOut(): void {
    localStorage.removeItem('currentUser');
    localStorage.clear();
    this.router.navigate(['/login'])
  }


}
