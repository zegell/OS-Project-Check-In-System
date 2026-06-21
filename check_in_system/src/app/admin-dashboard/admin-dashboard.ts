import { Component, inject, signal, OnInit, computed, OnDestroy, effect } from '@angular/core';
import { CheckInFetchService, GlobalCheckInLog, UserSystemLog } from '../check-in-fetch-service/check-in-fetch-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GpsDirectionPipe } from '../gps-direction/gps-direction';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, GpsDirectionPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private checkInService = inject(CheckInFetchService);
  public username = signal<string>('User');
  public errorMessage = signal<string | null>(null);
  public checkInLogs = this.checkInService.checkInLogs;
  public allUsers = this.checkInService.allUsers;
  public allCheckIns = this.checkInService.allCheckIns;
  public userDelete = signal<UserSystemLog | null>(null);
  public deleteModal = signal<boolean>(false);
  public userEdit = signal<UserSystemLog | null>(null);
  public editModal = signal<boolean>(false);
  public editFormRole = signal<string>('USER');
  public checkInDelete  = signal<GlobalCheckInLog | null>(null);
  public checkInDeleteModal = signal<boolean>(false);
  public userSearch = signal<string>('');
  public checkInSearch = signal<string>('');
  public currentCheckInPage = signal<number>(1);
  public currentUserPage = signal<number>(1);
  private userIdNum!: number;
  public checkInMeta = this.checkInService.checkInMeta;
  public userMeta = this.checkInService.userMeta;
  private sanitiser = inject(DomSanitizer);
  public mapEmbedUrl = signal<SafeResourceUrl | null>(null);

  constructor() {
    effect(() => {
      if (this.userIdNum) {
        this.checkInService.stopAdminPolling();
        this.checkInService.startAdminPolling(
          this.userIdNum,
          this.currentCheckInPage(),
          this.currentUserPage()
        );
      }
    });
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
          this.userIdNum = parseInt(userObj.user_id, 10);
          this.checkInService.fetchLiveProfile(this.userIdNum).subscribe({
            next: (liveUser) => {
              if (liveUser.user_type !== userObj.user_type) {
                console.log('User Type Mismatch');
                userObj.user_type = liveUser.user_type;
                localStorage.setItem('currentUser', JSON.stringify(userObj));

                if (liveUser.user_type !== 'ADMIN') {
                  alert('User Type Changed. Redirecting...');
                  this.router.navigate(['/login']);
                }
              }
            },
            error : (err) => {
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

  changeCheckInPage(step: number): void {
    const targetPage = this.currentCheckInPage() + step;
    if (targetPage >= 1 && targetPage <= this.checkInMeta().total_pages) {
      this.currentCheckInPage.set(targetPage);
      this.checkInService.triggerCheckInPageUpdate(targetPage);
    }
  }

  changeUserPage(step: number): void {
    const targetPage = this.currentUserPage() + step;
    if (targetPage >= 1 && targetPage <= this.userMeta().total_pages) {
      this.currentUserPage.set(targetPage);
      this.checkInService.triggerUserPageUpdate(targetPage);
    }
  }

  public onRowClick(latitude: number, longitude: number): void  {
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
    this.mapEmbedUrl.set(this.sanitiser.bypassSecurityTrustResourceUrl(url));
  }

  openDeleteModal(user: UserSystemLog): void {
    this.userDelete.set(user);
    this.deleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.userDelete.set(null);
    this.deleteModal.set(false);
  }

  confirmDelete(): void {
    const targetUser = this.userDelete();

    if (!targetUser) return;

    this.checkInService.deleteUser(targetUser.user_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allUsers.update(users => users.filter(u => u.user_id !== targetUser.user_id));
          this.allCheckIns.update(feed => feed.filter(c => c.username !== targetUser.username));
          this.closeDeleteModal();
        }
      },
      error: (err) => {
        console.error('Deletion aborted: ', err);
        this.errorMessage.set('Failed to complete account deletion on cascade');
        this.closeDeleteModal();
      }
    });
  }

  openEditModal(user: UserSystemLog): void {
    this.userEdit.set(user);
    this.editFormRole.set(user.user_type || 'USER');
    this.editModal.set(true);
  }

  closeEditModal(): void {
    this.userEdit.set(null);
    this.editModal.set(false);
  }

  onRoleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.editFormRole.set(selectElement.value);
  }

  confirmRoleUpdate(): void {
    const targetUser = this.userEdit();
    const updatedRole = this.editFormRole();
    if(!targetUser) return;

    this.checkInService.updateUserType(targetUser.user_id, updatedRole).subscribe({
      next: (response) => {
        if (response.success) {
          this.allUsers.update(users => users.map(u => u.user_id === targetUser.user_id ? {...u, user_type: updatedRole} : u));
          const currentUserData = localStorage.getItem('currentUser');

          if (currentUserData) {
            const userObj = JSON.parse(currentUserData);

            if (parseInt(userObj.user_id, 10) === targetUser.user_id) {
              userObj.user_type = updatedRole;
              localStorage.setItem('currentUser', JSON.stringify(userObj));

              if (updatedRole !== 'ADMIN') {
                this.closeEditModal();
                alert('User Type Changed. Redirecting...');
                this.router.navigate(['/login']);
                return;
              }
            }
          }
          this.closeEditModal();
        }
      },
      error: (err) => {
        console.error('Role patch aborted:', err);
        this.errorMessage.set('Could not rewrite admin profile permission');
        this.closeEditModal();
      }
    });
  }

  openCheckInDeleteModal(checkin: GlobalCheckInLog): void {
    this.checkInDelete.set(checkin);
    this.checkInDeleteModal.set(true);
  }

  closeCheckInDeleteModal(): void {
    this.checkInDelete.set(null);
    this.checkInDeleteModal.set(false);
  }

  confirmCheckInDelete(): void {
    const targetCheckIn = this.checkInDelete();
    if (!targetCheckIn) return;

    this.checkInService.deleteCheckIn(targetCheckIn.checkin_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allCheckIns.update(feed => feed.filter(c => c.checkin_id !== targetCheckIn.checkin_id));
          this.checkInLogs.update(logs => logs.filter(l => l.checkin_id !== targetCheckIn.checkin_id));
          this.closeCheckInDeleteModal();
        }
      },
      error: (err) => {
        console.error('Check-in deletion error: ', err);
        this.errorMessage.set('Could not delete check-in');
        this.closeCheckInDeleteModal();
      }
    });
  }

  public filteredUsers = computed(() => {
    const query = this.userSearch().toLowerCase().trim();
    if (!query) return this.allUsers();
    return this.allUsers().filter(user => user.username.toLowerCase().includes(query));
  });

  public filteredCheckIn = computed(() => {
    const query = this.checkInSearch().toLowerCase().trim();
    if (!query) return this.allCheckIns();
    return this.allCheckIns().filter(log => log.username.toLowerCase().includes(query));
  });

  public personalTotalCheckIn = computed(() => this.checkInLogs().length);
  public totalUser = computed(() => this.userMeta().total_records);
  public totalCheckIn = computed(() => this.checkInMeta().total_records);

  onUserSearch(event: Event, inputElement: HTMLInputElement): void {
    event.preventDefault();
    this.userSearch.set(inputElement.value);
  }

  onCheckInSearch(event: Event, inputElement: HTMLInputElement): void {
    event.preventDefault();
    this.checkInSearch.set(inputElement.value);
  }

  public logOut(): void {
    localStorage.removeItem('currentUser');
    localStorage.clear();
    this.router.navigate(['/login'])
  }
}
