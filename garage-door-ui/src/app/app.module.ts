import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './components/app/app.component';
import { LoginComponent } from './components/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuard } from './route-guards/auth.guard';
import { LoggedInGuard } from './route-guards/logged-in.guard';
import { GarageDoorComponent } from './components/garage-door/garage-door.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './components/history/history.component';
import { version } from '../../../package.json';
import { SocketFactory, AuthTokenService, GarageDoorHttpService, BrowserTokenStore } from '../../../shared';
import { environment } from 'src/environments/environment';

@NgModule({
    declarations: [AppComponent, LoginComponent, GarageDoorComponent, HistoryComponent],
    imports: [BrowserModule, CommonModule, HttpClientModule, FormsModule, AppRoutingModule, FontAwesomeModule],
    providers: [
        { provide: SocketFactory, useValue: new SocketFactory(console, environment.updatesUrl) },
        { provide: 'tokenStore', useValue: new BrowserTokenStore() },
        AuthTokenService,
        AuthGuard,
        LoggedInGuard,
        GarageDoorHttpService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(titleService: Title) {
        titleService.setTitle(`Garage Door Opener ${version}`);
    }
}
