import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IControlDoor } from '../../../../../shared';

@Component({
    selector: 'app-time',
    templateUrl: './time.component.html',
    styleUrls: ['./time.component.scss'],
})
export class TimeComponent {
    constructor(private http: HttpClient) {}

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    private _time: string | undefined;

    public get time(): string {
        return this._time == null ? 'Not Loaded' : this._time;
    }

    public loadTime() {
        const payload: IControlDoor = {
            action: 'open',
        };
        this.http.put<{ result: string }>('api/door', payload).subscribe(
            (response) => {
                console.log(`RESPONSE received: ${response.result}`);

                this._time = response.result;
            },
            (error) => {
                this._error = error.message;
                console.log;
            },
        );
    }
}
