import { Disposable } from '@univerjs/core';
import { ISyncOptions, NewRowBase } from '../interfaces';
import { IWorksheetDataPartial, SnapshotService } from '../services/snapshot.service';
import { StateService } from '../services/state.service';
export declare class WorksheetSyncController<Row = unknown, NewRow extends object | false = NewRowBase | false> extends Disposable {
    private id;
    private _snapshotService;
    private _stateService;
    constructor(id: string, _snapshotService: SnapshotService, _stateService: StateService);
    updateUniverWorksheet(worksheet: IWorksheetDataPartial): void;
    setDataModel(syncOptions: ISyncOptions<Row, NewRow>): void;
    getDataModel(): Readonly<ISyncOptions<Row, NewRow> | undefined>;
}
