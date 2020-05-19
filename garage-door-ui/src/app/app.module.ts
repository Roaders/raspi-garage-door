import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './components/app/app.component';
import { AuthHttpInterceptor } from './interceptors/bearer-token.interceptor';
import { AuthTokenService } from './services/auth-token.service';
import { LoginComponent } from './components/login/login.component';
import { TimeComponent } from './components/time/time.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuardService } from './services/auth-guard.service';

@NgModule({
    declarations: [AppComponent, LoginComponent, TimeComponent],
    imports: [BrowserModule, HttpClientModule, FormsModule, AppRoutingModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
        AuthTokenService,
        AuthGuardService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
