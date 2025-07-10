import { Disposable, Workbook } from '@univerjs/core';
import { IEditorBridgeService, ISheetCellDropdownManagerService } from '@univerjs/sheets-ui';
import { CommandEmitterService } from './command-emitter.service';
import { StateService } from './state.service';
export declare class CellDropdownService extends Disposable {
    readonly _commandEmitter: CommandEmitterService;
    readonly _cellDropdownManager: ISheetCellDropdownManagerService;
    readonly _editorBridgeService: IEditorBridgeService;
    readonly _stateService: StateService;
    private _disposeDropdown;
    constructor(workbook: Workbook, _commandEmitter: CommandEmitterService, _cellDropdownManager: ISheetCellDropdownManagerService, _editorBridgeService: IEditorBridgeService, _stateService: StateService);
}
