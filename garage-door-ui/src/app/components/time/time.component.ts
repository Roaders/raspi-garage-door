import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-time',
    templateUrl: './time.component.html',
    styleUrls: ['./time.component.scss'],
})
export class TimeComponent {
    constructor(private html: HttpClient) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    private _time: string | undefined;

    public get time(): string {
        return this._time == null ? 'Not Loaded' : this._time;
    }

    public loadTime() {
        this.html.get<{ time: string }>('api/time').subscribe(
            (response) => {
                console.log(`RESPONSE received: ${response.time}`);

                this._time = response.time;
            },
            (error) => {
                this._error = error.message;
                console.log;
            },
        );
    }
}
