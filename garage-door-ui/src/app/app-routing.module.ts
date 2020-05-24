import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './route-guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { LoggedInGuard } from './route-guards/logged-in.guard';
import { GarageDoorComponent } from './components/garage-door/garage-door.component';

const routes: Routes = [
    { path: '', component: GarageDoorComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
