import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeComponent } from './components/time/time.component';
import { AuthGuard } from './services/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { LoggedInGuard } from './services/logged-in.guard';

const routes: Routes = [
    { path: '', component: TimeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
