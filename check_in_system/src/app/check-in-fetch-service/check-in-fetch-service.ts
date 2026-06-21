import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable , WritableSignal, inject, signal } from '@angular/core';
import { Observable, Subscription, switchMap, timer, combineLatest, BehaviorSubject } from 'rxjs';

export interface CheckInLog {
  checkin_id: number;
  latitude: number;
  longitude: number;
  check_in_time: string;
}

export interface UserSystemLog {
  user_id: number;
  username: string;
  user_type: string;
}

export interface GlobalCheckInLog {
  username: string;
  checkin_id: number;
  latitude: number;
  longitude: number;
  check_in_time: string;
}

export interface PaginationMeta {
  total_records: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

@Injectable({providedIn: 'root'})

export class CheckInFetchService {
  private http = inject(HttpClient);
  private apiUrl = 'https://forsynthia.shares.zrok.io/check-in-system-api';

  public allUsers = signal<UserSystemLog[]>([]);
  public allCheckIns = signal<GlobalCheckInLog[]>([]);
  public checkInLogs = signal<CheckInLog[]>([]);
  private adminPollingSub?: Subscription;
  public checkInMeta = signal<PaginationMeta>({total_records: 0, total_pages: 1, current_page: 1, limit: 10});
  public userMeta = signal<PaginationMeta>({total_records: 0, total_pages: 1, current_page: 1, limit: 10});
  private checkInPage$ = new BehaviorSubject<number>(1);
  private userPage$ = new BehaviorSubject<number>(1);

  startAdminPolling(userId: number, checkInPageNum: number, userPageNum: number): void {
    this.checkInPage$.next(checkInPageNum);
    this.userPage$.next(userPageNum);
    
    if (this.adminPollingSub) return;

    this.adminPollingSub = this.checkInPage$.pipe(switchMap(page => timer(0,5000).pipe(switchMap(()=> this.getAllCheckIns(page, 10))))).subscribe({
      next: (res: any) => {
        this.allCheckIns.set(res.data);
        this.checkInMeta.set(res.pagination);
      },
      error: (err) => console.error('Live feed sync dropped:', err)
    });

    this.adminPollingSub.add(this.userPage$.pipe(switchMap(page => timer(0, 10000).pipe(switchMap(()=> this.getAllUsers(page, 10))))).subscribe({
      next: (res: any) => {
        this.allUsers.set(res.data);
        this.userMeta.set(res.pagination)
      },
      error: (err) => console.error('User live fetching sync dropped') 
    }));

    if (userId) {
    this.adminPollingSub.add(timer(0, 5000).pipe(switchMap(() => this.getCheckInHistory(userId))).subscribe({
      next: (data) => this.checkInLogs.set(data),
      error: (err) => console.error('Personal fetching sync dropped')
    }));}

  };

  triggerCheckInPageUpdate(page: number): void {
    this.checkInPage$.next(page);
  }

  triggerUserPageUpdate(page: number): void {
    this.userPage$.next(page);
  }

  stopAdminPolling(): void {
    if (this.adminPollingSub) {
      this.adminPollingSub.unsubscribe();
      this.adminPollingSub = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopAdminPolling();
  }

  getCheckInHistory(userId: number): Observable<CheckInLog[]> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.http.get<CheckInLog[]>(`${this.apiUrl}/fetch-checkin.php`, {params});
  }

  getAllUsers(page: number, limit: number): Observable<UserSystemLog[]> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<UserSystemLog[]>(`${this.apiUrl}/fetch-all-users.php`, {params});
  }

  getAllCheckIns(page: number, limit: number): Observable<GlobalCheckInLog[]>{
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<GlobalCheckInLog[]>(`${this.apiUrl}/fetch-all-checkins.php`, {params});
  }

  deleteUser(userId: number): Observable<{success: boolean, message: string}>{
    return this.http.post<{success: boolean, message: string}>(`${this.apiUrl}/delete-user.php`, {user_id: userId})
  };

  updateUserType(userId: number, newType: string): Observable<{success: boolean, message: string}> {
    return this.http.post<{success: boolean, message: string}>(`${this.apiUrl}/change-user-type.php`, {user_id: userId, new_type: newType});
  }

  deleteCheckIn(checkInId: number): Observable<{success: boolean, message: string}> {
    return this.http.post<{success: boolean, message: string}>(`${this.apiUrl}/delete-checkin.php`, {checkin_id: checkInId});
  }

  fetchLiveProfile(userId: number): Observable<UserSystemLog> {
    return this.http.get<UserSystemLog>(`${this.apiUrl}/fetch-user-type.php?user_id=${userId}`);
  }
}
