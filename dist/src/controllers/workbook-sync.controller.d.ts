import { Disposable, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { NewRowBase } from '../interfaces';
import { IWorksheetDataPartial } from '../services/snapshot.service';
import { WorksheetSyncController } from './worksheet-sync.controller';
export declare class WorkbookSyncController extends Disposable {
    private _univer;
    private _injector;
    private _stateService;
    private _snapshotService;
    private _worksheetMap;
    constructor(_univer: Univer);
    private createDependency;
    bootstrap(options?: Partial<Omit<IWorkbookData, 'sheetOrder' | 'sheets'>>): Workbook;
    addSheet<Row = unknown, NewRow extends object | false = NewRowBase | false>(worksheet: IWorksheetDataPartial): WorksheetSyncController<Row, NewRow>;
    getWorksheetSyncController<Row, NewRow extends object | false = NewRowBase | false>(id: string): WorksheetSyncController<Row, NewRow> | undefined;
}
