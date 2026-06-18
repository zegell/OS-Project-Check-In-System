import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { authRole } from './auth-role/auth-role';
import { Signup } from './signup/signup';
import { UserDashboard } from './user-dashboard/user-dashboard';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path: 'signup', component: Signup},
    {path: '', component: UserDashboard, canActivate: [authRole], data: {role: 'USER'}},
    {path: 'admin-dashboard', component: AdminDashboard, canActivate: [authRole], data: {role: 'ADMIN'}},
    {path: '**', redirectTo: ''}
];

