import { Routes } from '@angular/router';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
	{ path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [roleGuard(['Profesor', 'Alumno', 'Administrador'])] },
	{ path: 'student', loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent), canActivate: [roleGuard(['Alumno'])] },
	{ path: 'teacher', loadComponent: () => import('./features/teacher/dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent), canActivate: [roleGuard(['Profesor'])] },
	{ path: 'teacher/calendario', loadComponent: () => import('./features/teacher/calendar/teacher-calendar.component').then(m => m.TeacherCalendarComponent), canActivate: [roleGuard(['Profesor'])] },
	{ path: 'admin', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [roleGuard(['Administrador'])] },
	{ path: '**', redirectTo: 'login' }
];
