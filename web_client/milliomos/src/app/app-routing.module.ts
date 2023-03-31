import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { RegistrationComponent } from './registration/registration.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { ProfileComponent } from './profile/profile.component';
import { LobbyComponent } from './lobby/lobby.component';
import { GameComponent } from './game/game.component';
import { AdminQuestionsComponent } from './admin-questions/admin-questions.component';
import {DataprivacyComponent} from "./dataprivacy/dataprivacy.component";
import {AngularFireAuthGuard, redirectUnauthorizedTo} from "@angular/fire/compat/auth-guard";

const redirectUnauthorizedToLanding = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    path: 'lobby',
    component: LobbyComponent,
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: 'game',
    component: GameComponent,
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegistrationComponent
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: 'admin-users',
    component: AdminUsersComponent,
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: 'admin-questions',
    component: AdminQuestionsComponent,
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'dataprivacy',
    component: DataprivacyComponent
  },
  {
    path: '**',
    component: MainComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
