import { Disposable } from '@univerjs/core';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { CellPopupService } from './cell-popup.service';
import { CommandEmitterService } from './command-emitter.service';
import { StateService } from './state.service';
export declare class CellsProtectionService extends Disposable {
    readonly _commandEmitter: CommandEmitterService;
    readonly _editorBridgeService: IEditorBridgeService;
    readonly _stateService: StateService;
    readonly _cellPopup: CellPopupService;
    constructor(_commandEmitter: CommandEmitterService, _editorBridgeService: IEditorBridgeService, _stateService: StateService, _cellPopup: CellPopupService);
    private handleProtectedCellCheck;
}
