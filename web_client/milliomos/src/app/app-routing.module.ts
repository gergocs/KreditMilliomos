import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';
import { AdminQuestionsComponent } from './components/admin-questions/admin-questions.component';
import {DataprivacyComponent} from "./components/dataprivacy/dataprivacy.component";
import {AngularFireAuthGuard, redirectUnauthorizedTo} from "@angular/fire/compat/auth-guard";
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import {EndscreenComponent} from "./components/endscreen/endscreen.component";

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
    component: MainComponent
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
    path: 'admin-category',
    component: AdminCategoryComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLanding}
  },
  {
    path: 'endscreen',
    component: EndscreenComponent,
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
