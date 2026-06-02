import { Routes } from '@angular/router';
import { LoginFormComponent } from './features/auth/components/login-form/login-form.component';
import { RegisterFormComponent } from './features/auth/components/register-form/register-form.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { JogoListComponent } from './features/jogos/components/jogo-list/jogo-list.component';
import { JogoFormComponent } from './features/jogos/components/jogo-form/jogo-form.component';
import { JogoDetailComponent } from './features/jogos/components/jogo-detail/jogo-detail.component';
import { JogoAdminComponent } from './features/jogos/components/jogo-admin/jogo-admin.component';
import { MinhasApostasComponent } from './features/jogos/components/minhas-apostas/minhas-apostas.component';
import { JogosDashboardComponent } from './features/jogos/components/jogos-dashboard/jogos-dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  { path: 'register', component: RegisterFormComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'jogos', pathMatch: 'full' },
      { path: 'jogos', component: JogoListComponent },
      { path: 'jogos/painel', component: JogosDashboardComponent },
      { path: 'jogos/novo', component: JogoFormComponent },
      { path: 'jogos/:id', component: JogoDetailComponent },
      { path: 'jogos/:id/editar', component: JogoFormComponent },
      { path: 'jogos/:id/admin', component: JogoAdminComponent },
      { path: 'minhas-apostas', component: MinhasApostasComponent },
    ]
  }
];

