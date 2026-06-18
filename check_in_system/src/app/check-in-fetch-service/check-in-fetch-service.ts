import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable , inject } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({providedIn: 'root'})

export class CheckInFetchService {
  private http = inject(HttpClient);
  private apiUrl = 'https://forsynthia.shares.zrok.io/check-in-system-api';

  getCheckInHistory(userId: number): Observable<CheckInLog[]> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.http.get<CheckInLog[]>(`${this.apiUrl}/fetch-checkin.php`, {params});
  }

  getAllUsers(): Observable<UserSystemLog[]> {
    return this.http.get<UserSystemLog[]>(`${this.apiUrl}/fetch-all-users.php`);
  }

  getAllCheckIns(): Observable<GlobalCheckInLog[]>{
    return this.http.get<GlobalCheckInLog[]>(`${this.apiUrl}/fetch-all-checkins.php`);
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
