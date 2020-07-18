import { Component, OnInit } from '@angular/core';
import { GarageDoorHttpService } from 'src/app/services';
import { getStatusStyle, getLockIcon, stringifyError } from 'src/app/helpers';
import { subtract, format } from 'date-and-time';
import { IStatusChangeImage } from '../../../../../shared';

@Component({
    selector: 'history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
    constructor(private service: GarageDoorHttpService) {}

    ngOnInit(): void {
        this.service.getLatestImage().subscribe((images) => this.addImage(...images));
    }

    private _error: string | undefined;

    public get error(): string | undefined {
        return this._error;
    }

    private _takingPicture = false;

    public get takingPicture() {
        return this._takingPicture;
    }

    private _loadingMore = false;

    public get loadingMore() {
        return this._loadingMore;
    }

    private _allLoaded = false;

    public get allLoaded() {
        return this._allLoaded;
    }

    private _statusUpdates: IStatusChangeImage[] = [];

    public get statusUpdates(): IStatusChangeImage[] {
        return this._statusUpdates;
    }

    public getImagePath(image: IStatusChangeImage) {
        return `/images/${image.name}`;
    }

    public getTimeStamp(image: IStatusChangeImage) {
        const now = new Date();
        const statusTimestamp = new Date(image.timestamp);
        const difference = subtract(
            new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            new Date(statusTimestamp.getFullYear(), statusTimestamp.getMonth(), statusTimestamp.getDate()),
        ).toDays();

        switch (difference) {
            case 0:
                return `Today ${format(statusTimestamp, 'HH:mm')}`;
            case 1:
                return `Yesterday ${format(statusTimestamp, 'HH:mm')}`;

            default:
                return `${format(statusTimestamp, 'DD/MM/YYYY HH:mm')}`;
        }
    }

    public getStatus(image: IStatusChangeImage) {
        switch (image.status) {
            case 'CLOSED':
                return `Closed`;
            case 'CLOSING':
                return `Closing`;
            case 'OPEN':
                return `Open`;
            case 'OPENING':
                return `Opening`;

            default:
                return 'Unknown';
        }
    }

    public getIcon(image: IStatusChangeImage) {
        return getLockIcon(image.status);
    }

    public getStatusStyle(image: IStatusChangeImage): string {
        return getStatusStyle(image.status);
    }

    public takePicture() {
        this._takingPicture = true;
        this._error = undefined;
        this.service.takePicture().subscribe(
            (image) => {
                this._takingPicture = false;
                this.addImage(image);
            },
            (error) => {
                this._takingPicture = false;
                this._error = stringifyError(error);
            },
        );
    }

    public loadMore() {
        this._loadingMore = true;
        this._error = undefined;
        this.service.getImages(this._statusUpdates[this._statusUpdates.length - 1].timestamp).subscribe(
            (images) => {
                if (images.length < 5) {
                    this._allLoaded = true;
                }
                this._loadingMore = false;
                this.addImage(...images);
            },
            (error) => {
                this._loadingMore = false;
                this._error = stringifyError(error);
            },
        );
    }

    private addImage(...images: IStatusChangeImage[]) {
        this._statusUpdates.push(...images.filter((image) => this.imageFilter(image)));

        this._statusUpdates = this._statusUpdates.sort((one, two) => two.timestamp - one.timestamp);
    }

    private imageFilter(image: IStatusChangeImage) {
        return this.statusUpdates.every((existingImage) => existingImage.name != image.name);
    }
}
