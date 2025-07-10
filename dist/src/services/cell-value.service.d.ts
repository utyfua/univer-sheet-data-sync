import { Disposable } from '@univerjs/core';
import { ICellDataWithSyncState, ICellSyncState } from '../interfaces';
import { CommandEmitterService } from './command-emitter.service';
import { SnapshotService } from './snapshot.service';
import { SheetState, StateService } from './state.service';
export declare const isRejectInvalidInput: (state: SheetState, cellState: ICellSyncState) => boolean;
export declare const buildCellData: (state: SheetState, i: number, j: number, isNewRow?: boolean, row?: unknown) => ICellDataWithSyncState;
export declare const adjustCellData: (state: SheetState, cell: ICellDataWithSyncState, 
/**
 * undefined - if the cell is NOT being adjusted at all
 * true - if the cell is being adjusted during an undo operation
 * false - if the cell is being adjusted during a normal operation
 */
isUndo?: boolean) => void;
export declare class CellValueService extends Disposable {
    readonly _commandEmitter: CommandEmitterService;
    readonly _stateService: StateService;
    readonly _snapshotService: SnapshotService;
    private _isUndoActive;
    constructor(_commandEmitter: CommandEmitterService, _stateService: StateService, _snapshotService: SnapshotService);
}
