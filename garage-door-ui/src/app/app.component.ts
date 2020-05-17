import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private html: HttpClient) {}

    private _time: string | undefined;

    public get time(): string {
        return this._time == null ? 'Not Loaded' : this._time;
    }

    public loadTime() {
        this.html.get<{ time: string }>('api/time').subscribe((response) => {
            console.log(`RESPONSE received: ${response.time}`);

            this._time = response.time;
        });
    }
}
