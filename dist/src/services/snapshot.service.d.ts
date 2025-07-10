import { Disposable, IUndoRedoService, IWorkbookData, IWorksheetData } from '@univerjs/core';
import { ISyncOptions } from '../interfaces';
import { CommandEmitterService } from './command-emitter.service';
import { StateService } from './state.service';
export type IWorksheetDataPartial = Partial<Omit<IWorksheetData, 'rowCount' | 'columnCount' | 'cellData'>>;
export declare class SnapshotService extends Disposable {
    readonly _commandEmitter: CommandEmitterService;
    readonly _stateService: StateService;
    readonly _undoRedoService: IUndoRedoService;
    private _activeSheetListener;
    constructor(_commandEmitter: CommandEmitterService, _stateService: StateService, _undoRedoService: IUndoRedoService);
    getBootstrapOptions(options?: Partial<Omit<IWorkbookData, 'sheetOrder' | 'sheets'>>): Partial<IWorkbookData>;
    getSheetById(id: string): import("@univerjs/core").Worksheet | undefined;
    upsertUniverWorksheet(worksheet: IWorksheetDataPartial): string;
    setWorksheetSyncDataModel(worksheetId: string, syncOptions: ISyncOptions): void;
    private syncActiveSheetListener;
    addNewFreeRow(): void;
}
