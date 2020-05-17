import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AuthHttpInterceptor } from './interceptors/bearer-token.interceptor';
import { AuthTokenService } from './services/auth-token.service';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, HttpClientModule, FormsModule],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true }, AuthTokenService],
    bootstrap: [AppComponent],
})
export class AppModule {}
