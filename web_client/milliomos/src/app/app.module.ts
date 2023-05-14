import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {MatButtonModule} from "@angular/material/button";
import { ProfileComponent } from './components/profile/profile.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';
import { AdminQuestionsComponent } from './components/admin-questions/admin-questions.component';
import { DataprivacyComponent } from './components/dataprivacy/dataprivacy.component';
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import {MatSliderModule} from "@angular/material/slider";
import { QuestionFilterPipe } from './pipes/question-filter.pipe';
import { EndscreenComponent } from './components/endscreen/endscreen.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatCardModule} from "@angular/material/card";
import { BadWordPipe } from './pipes/bad-word.pipe';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    MainComponent,
    AdminUsersComponent,
    AdminQuestionsComponent,
    ConfirmationDialogComponent,
    ProfileComponent,
    LobbyComponent,
    GameComponent,
    DataprivacyComponent,
    AdminCategoryComponent,
    QuestionFilterPipe,
    EndscreenComponent,
    BadWordPipe,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideAuth(() => getAuth()),
    NgbModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    FormsModule,
    MatProgressBarModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
