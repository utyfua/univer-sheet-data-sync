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
import { CellValueType, Disposable, Inject, ObjectMatrix, } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { CommandEmitterService } from './command-emitter.service';
import { SnapshotService } from './snapshot.service';
import { StateService } from './state.service';
const getCellRealValue = (cell) => cell.isDefaultValue ? null : cell._ref.v;
export const isRejectInvalidInput = (state, cellState) => (state.syncOptions?.rejectInvalidInput &&
    cellState.column?.rejectInvalidInput !== false) ||
    cellState.column.rejectInvalidInput === true;
export const buildCellData = (state, i, j, isNewRow, row) => {
    var _a;
    const cell = {
        syncRef: () => cellState,
    };
    let cellState;
    const column = state.computed.columns[j];
    if (isNewRow) {
        const row = ((_a = state.newRowsData)[i] ?? (_a[i] = state.syncOptions?.freeRowDefault?.() ?? {}));
        const syncData = column.extractNewCellData?.(row, column) ?? {};
        cellState = {
            _ref: cell,
            row,
            column,
            syncData,
            isNewRow: true,
        };
        cell.v = row[column.key] ?? syncData.value;
    }
    else {
        row ?? (row = state.syncOptions?.data?.[i]);
        const syncData = column.extractCellData(row, column);
        cellState = {
            _ref: cell,
            row,
            column,
            syncData,
        };
        cell.v = syncData.value;
    }
    adjustCellData(state, cell);
    return cell;
};
export const adjustCellData = (state, cell, 
/**
 * undefined - if the cell is NOT being adjusted at all
 * true - if the cell is being adjusted during an undo operation
 * false - if the cell is being adjusted during a normal operation
 */
isUndo) => {
    const cellState = cell.syncRef?.();
    if (!cellState?.syncData)
        return;
    const defaultValue = cellState.syncData.defaultValue;
    if (defaultValue !== undefined && (cell.v === undefined || cell.v === null)) {
        cell.v = defaultValue;
        cellState.isDefaultValue = true;
    }
    else if (cellState.isDefaultValue && cell.v !== defaultValue) {
        cellState.isDefaultValue = false;
    }
    if (typeof cell.v === 'object')
        cell.v = JSON.stringify(cell.v);
    const realValue = getCellRealValue(cellState);
    if (isUndo !== undefined) {
        if (!isRejectInvalidInput(state, cellState)) {
            cellState.validationError = cellState.column.validateCellValue?.(realValue, cellState);
        }
        if (cellState.isNewRow) {
            cellState.row[cellState.column.key] = realValue;
        }
    }
    cell.t =
        cellState.syncData.type ??
            (typeof cell.v === 'number'
                ? CellValueType.NUMBER
                : typeof cell.v === 'boolean'
                    ? CellValueType.BOOLEAN
                    : undefined);
    const s = (!cell.s || typeof cell.s === 'object' ? (cell.s ?? (cell.s = {})) : (cell.s = {}));
    if (cellState.isDefaultValue) {
        s.it = 1;
        s.cl = { rgb: '#4472C4' };
    }
    else {
        delete s.it;
        delete s.cl;
    }
    if (cellState.validationError) {
        s.bg = { rgb: '#FFCDD2' };
    }
    else if (cellState.isPendingSave) {
        s.bg = { rgb: '#FAF3C0' };
    }
    else if (cellState.isNewRow &&
        realValue !== undefined &&
        realValue !== null) {
        s.bg = { rgb: '#E3F2FD' };
    }
    else {
        delete s.bg;
    }
};
let CellValueService = class CellValueService extends Disposable {
    constructor(_commandEmitter, _stateService, _snapshotService) {
        super();
        Object.defineProperty(this, "_commandEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _commandEmitter
        });
        Object.defineProperty(this, "_stateService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _stateService
        });
        Object.defineProperty(this, "_snapshotService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _snapshotService
        });
        Object.defineProperty(this, "_isUndoActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        _commandEmitter.registerBeforeCommandExecuted('univer.command.undo', () => {
            this._isUndoActive = true;
        });
        _commandEmitter.registerAfterCommandExecuted('univer.command.undo', () => {
            this._isUndoActive = false;
        });
        _commandEmitter.registerAfterCommandExecuted(SetRangeValuesMutation, (commandInfo) => {
            const state = this._stateService.getActiveSheetState();
            if (!state)
                return;
            const newRows = {};
            const cellValue = new ObjectMatrix(commandInfo.params.cellValue);
            cellValue.forValue((row, column, _cell) => {
                const cellState = state.getCellDataByPos({ row, column })?.syncRef?.();
                if (!cellState?.syncData)
                    return;
                adjustCellData(state, cellState._ref, this._isUndoActive);
                cellState.column.onCellValueChange?.(getCellRealValue(cellState), cellState);
                if (cellState.isNewRow) {
                    newRows[row] = cellState.row;
                }
            });
            let snapshotModded = false;
            for (const [snapshotRowIndex, row] of Object.entries(newRows)) {
                const snapshotRow = state.snapshot.cellData[snapshotRowIndex];
                const cells = Object.values(snapshotRow).map((cell) => cell.syncRef());
                const savedRow = state.syncOptions?.onNewRow?.(row, cells);
                if (!savedRow)
                    continue;
                const rowIndex = state.newRowsData.indexOf(row);
                if (rowIndex === -1)
                    throw new Error('Row not found in new rows data');
                state.newRowsData.splice(rowIndex, 1);
                this._snapshotService.addNewFreeRow();
                snapshotModded = true;
                if (savedRow === true)
                    continue;
                for (let i = 0; i < cells.length; i++) {
                    snapshotRow[i] = buildCellData(state, 0, i, false, savedRow);
                }
            }
            if (snapshotModded) {
                this._commandEmitter.rerenderWorkbook();
            }
        });
    }
};
CellValueService = __decorate([
    __param(0, Inject(CommandEmitterService)),
    __param(1, Inject(StateService)),
    __param(2, Inject(SnapshotService)),
    __metadata("design:paramtypes", [CommandEmitterService,
        StateService,
        SnapshotService])
], CellValueService);
export { CellValueService };
//# sourceMappingURL=cell-value.service.js.map