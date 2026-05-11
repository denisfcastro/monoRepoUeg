import { Routes } from '@angular/router';
import { LoginFormComponent } from './features/auth/components/login-form/login-form.component';
import { RegisterFormComponent } from './features/auth/components/register-form/register-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  { path: 'register', component: RegisterFormComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redireciona para login por padrão
];
