var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { CustomCommandExecutionError, Disposable, Inject, ObjectMatrix, } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { IEditorBridgeService, SetCellEditVisibleOperation, } from '@univerjs/sheets-ui';
import { CellPopupService } from './cell-popup.service';
import { isRejectInvalidInput } from './cell-value.service';
import { CommandEmitterService } from './command-emitter.service';
import { StateService } from './state.service';
let CellsProtectionService = class CellsProtectionService extends Disposable {
    constructor(_commandEmitter, _editorBridgeService, _stateService, _cellPopup) {
        super();
        Object.defineProperty(this, "_commandEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _commandEmitter
        });
        Object.defineProperty(this, "_editorBridgeService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _editorBridgeService
        });
        Object.defineProperty(this, "_stateService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _stateService
        });
        Object.defineProperty(this, "_cellPopup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _cellPopup
        });
        this._commandEmitter.registerBeforeCommandExecuted(SetCellEditVisibleOperation, (commandInfo) => {
            if (!commandInfo.params?.visible)
                return;
            this.handleProtectedCellCheck();
        });
        this._commandEmitter.registerBeforeCommandExecuted([
            'doc.command.insert-text',
            'doc.command.delete-text',
            'doc.command.delete-left',
            'doc.command.delete-right',
        ], this.handleProtectedCellCheck.bind(this));
        _commandEmitter.registerBeforeCommandExecuted(SetRangeValuesMutation, (commandInfo) => {
            const state = this._stateService.getActiveSheetState();
            if (!state)
                return;
            const cellValue = new ObjectMatrix(commandInfo.params.cellValue);
            cellValue.forValue((row, column, cell) => {
                const location = {
                    col: column,
                    row: row,
                    unitId: commandInfo.params.unitId,
                    subUnitId: commandInfo.params.subUnitId,
                };
                if (cell?.f) {
                    this._cellPopup.showFormulaRejectPopup(location);
                    throw new CustomCommandExecutionError('Formula Cell');
                }
                const cellState = state.getCellDataByPos(location)?.syncRef?.();
                if (!cellState?.syncData || cellState.syncData?.isProtected) {
                    this._cellPopup.showProtectedPopup(location);
                    throw new CustomCommandExecutionError('Protected Cell');
                }
                if (isRejectInvalidInput(state, cellState)) {
                    const isInvalid = cellState.column?.validateCellValue?.(cell?.v, cellState);
                    if (isInvalid) {
                        this._cellPopup.showInvalidPopup(location, isInvalid);
                        throw new CustomCommandExecutionError('Invalid Cell');
                    }
                }
            });
        });
    }
    handleProtectedCellCheck() {
        const editCellState = this._editorBridgeService.getEditCellState();
        const state = this._stateService.getActiveSheetState();
        if (!state || !editCellState)
            return;
        const syncData = state.getCellDataByPos(editCellState)?.syncRef?.().syncData;
        if (syncData && !syncData?.isProtected)
            return;
        this._cellPopup.showProtectedPopup({
            col: editCellState.column,
            row: editCellState.row,
            unitId: editCellState.unitId,
            subUnitId: editCellState.sheetId,
        });
        throw new CustomCommandExecutionError('You are not allowed to perform this action');
    }
};
CellsProtectionService = __decorate([
    __param(0, Inject(CommandEmitterService)),
    __param(1, Inject(IEditorBridgeService)),
    __param(2, Inject(StateService)),
    __param(3, Inject(CellPopupService)),
    __metadata("design:paramtypes", [CommandEmitterService, Object, StateService,
        CellPopupService])
], CellsProtectionService);
export { CellsProtectionService };
//# sourceMappingURL=cell-protection.service.js.map