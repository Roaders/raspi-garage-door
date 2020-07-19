import { Injectable, Optional } from '@nestjs/common';
import { IGarageDoorStatus, DOOR_STATUS, isDefined, IStatusChangeImage } from '../../../shared';
import { GarageDoorService } from '../../../rpi-garage-door/src';
import { Observable, from, defer, Subject, empty, of } from 'rxjs';
import { mergeMap, catchError, map, distinctUntilKeyChanged, filter, shareReplay, tap } from 'rxjs/operators';
import { PiCameraFactory } from 'src/factory';
import { promises as fsPromises } from 'fs';
import { createImageDTO } from '../helpers';

const imageFileNameRegExp = /^(\d+)_(\w+).jpg$/;

@Injectable()
export class ImagesService {
    private readonly statusSubject = new Subject<IGarageDoorStatus<DOOR_STATUS>>();

    private _snapInProgress: Observable<string> | undefined;

    constructor(private garageDoorService: GarageDoorService, @Optional() private cameraFactory?: PiCameraFactory) {
        this.listenForEvents();

        this.startStream().subscribe();
    }

    public newImage(): Observable<IStatusChangeImage> {
        return from(this.garageDoorService.getState()).pipe(
            mergeMap((state) => this.snap(state)),
            map((imageName) => imageFileNameRegExp.exec(imageName)),
            map(createImageDTO),
            filter(isDefined),
        );
    }

    public getImages(maxCount = 10, before?: number): Observable<IStatusChangeImage[]> {
        const imagesFolder = this.cameraFactory?.imagesFolder;

        if (imagesFolder == null) {
            return of([]);
        }
        return from(fsPromises.readdir(imagesFolder)).pipe(
            map((images) =>
                images
                    .map((imageName) => imageFileNameRegExp.exec(imageName))
                    .map(createImageDTO)
                    .filter(isDefined)
                    .sort((one, two) => two.timestamp - one.timestamp)
                    .filter((image) => before == null || image.timestamp < before)
                    .slice(0, maxCount),
            ),
        );
    }

    private startStream(): Observable<string> {
        return this.statusSubject.pipe(
            distinctUntilKeyChanged('status'),
            mergeMap((status) => this.onStatusUpdate(status), 1),
            catchError((e) => {
                console.log(`Error taking photo: ${e}`);
                return this.startStream();
            }),
        );
    }

    private onStatusUpdate(status: IGarageDoorStatus) {
        return this.snap(status);
    }

    public snap(status: IGarageDoorStatus): Observable<string> {
        if (this._snapInProgress != null) {
            return this._snapInProgress;
        }

        const cameraFactory = this.cameraFactory;
        if (cameraFactory == null) {
            return empty();
        }

        const snapInProgress = defer(() => {
            const fileName = `${Date.now()}_${status.status}.jpg`;
            return from(cameraFactory.create(fileName).snap()).pipe(
                tap(() => (this._snapInProgress = undefined)),
                map(() => fileName),
            );
        }).pipe(shareReplay(1));

        this._snapInProgress = snapInProgress;

        return snapInProgress;
    }

    private async listenForEvents() {
        for await (const event of this.garageDoorService.events) {
            this.statusSubject.next(event);
        }
    }
}
