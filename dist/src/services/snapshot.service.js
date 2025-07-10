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
import { CellValueType, Disposable, IUndoRedoService, Inject, generateRandomId, } from '@univerjs/core';
import { buildCellData } from './cell-value.service';
import { CommandEmitterService } from './command-emitter.service';
import { StateService } from './state.service';
let SnapshotService = class SnapshotService extends Disposable {
    constructor(_commandEmitter, _stateService, _undoRedoService) {
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
        Object.defineProperty(this, "_undoRedoService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _undoRedoService
        });
        Object.defineProperty(this, "_activeSheetListener", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.disposeWithMe({
            dispose: () => {
                this._activeSheetListener?.disposable?.dispose();
            },
        });
        this._commandEmitter.registerAfterCommandExecuted('sheet.operation.set-worksheet-active', this.syncActiveSheetListener.bind(this));
    }
    getBootstrapOptions(options) {
        options ?? (options = {});
        options.id ?? (options.id = generateRandomId());
        options.name ?? (options.name = 'default');
        options.appVersion ?? (options.appVersion = '');
        options.styles ?? (options.styles = {});
        return {
            ...options,
            sheetOrder: Object.keys(this._stateService.state),
            sheets: Object.fromEntries(Object.entries(this._stateService.state).map(([id, state]) => [
                id,
                state.snapshot,
            ])),
        };
    }
    getSheetById(id) {
        return this._stateService.workbook
            ?.getSheets()
            .find((s) => s.getSheetId() === id);
    }
    upsertUniverWorksheet(worksheet) {
        const id = worksheet.id ?? generateRandomId();
        const snapshot = this._stateService.getState(id).snapshot;
        const workbook = this._stateService.workbook;
        workbook?.addWorksheet(id, workbook.getSheetOrders().length, snapshot);
        this._commandEmitter.rerenderWorkbook();
        return id;
    }
    setWorksheetSyncDataModel(worksheetId, syncOptions) {
        var _a, _b;
        const newState = this._stateService.setState(worksheetId, {
            syncOptions,
        });
        const snapshot = newState.snapshot;
        syncOptions = newState.syncOptions ?? {};
        let { columns, rowOffset } = newState.computed;
        columns?.forEach((column, i) => {
            var _a;
            if (column.width === snapshot.columnData[i]?.w)
                return;
            (_a = snapshot.columnData)[i] ?? (_a[i] = {});
            snapshot.columnData[i].w = column.width;
        });
        snapshot.columnCount = columns?.length || 1;
        snapshot.rowCount =
            (syncOptions?.data?.length || 0) +
                (syncOptions.freeRows || 0) +
                rowOffset || 1;
        const cellMatrix = snapshot.cellData;
        if (rowOffset) {
            const cellRow = (cellMatrix[0] ?? (cellMatrix[0] = []));
            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];
                cellRow[i] = {
                    v: column.displayName || '',
                    t: CellValueType.STRING,
                    s: { bl: 1 },
                };
                if (syncOptions.freeRows && !column.key) {
                    throw new Error(`Column ${column.displayName ?? ''} must have a key to be used in free rows.`);
                }
            }
        }
        if (syncOptions.data?.length) {
            for (let i = 0; i < syncOptions.data.length; i++) {
                const cellRow = (cellMatrix[_a = i + rowOffset] ?? (cellMatrix[_a] = []));
                for (let j = 0; j < columns.length; j++) {
                    cellRow[j] = buildCellData(newState, i, j);
                }
            }
            rowOffset += syncOptions.data.length;
        }
        if (syncOptions.freeRows) {
            for (let i = 0; i < syncOptions.freeRows; i++) {
                const cellRow = (cellMatrix[_b = i + rowOffset] ?? (cellMatrix[_b] = []));
                for (let j = 0; j < columns.length; j++) {
                    cellRow[j] = buildCellData(newState, i, j, true);
                }
            }
        }
        const workbook = this._stateService.workbook;
        if (workbook) {
            this._undoRedoService.clearUndoRedo(workbook.getUnitId());
            this._commandEmitter.rerenderWorkbook();
            this.syncActiveSheetListener();
        }
    }
    syncActiveSheetListener() {
        const state = this._stateService.getActiveSheetState();
        const nextListener = state?.syncOptions?.onActiveListener;
        if (this._activeSheetListener?.listener === nextListener)
            return;
        this._activeSheetListener?.disposable?.dispose();
        if (!nextListener)
            this._activeSheetListener = undefined;
        else {
            this._activeSheetListener = {
                listener: nextListener,
            };
            this._activeSheetListener.disposable = nextListener();
        }
    }
    addNewFreeRow() {
        var _a, _b;
        const state = this._stateService.getActiveSheetState();
        if (!state)
            return;
        const snapshot = state.snapshot;
        const cellRow = ((_a = snapshot.cellData)[_b = snapshot.rowCount++] ?? (_a[_b] = []));
        const i = state.newRowsData.length;
        const columns = state.computed.columns;
        for (let j = 0; j < columns.length; j++) {
            cellRow[j] = buildCellData(state, i, j, true);
        }
    }
};
SnapshotService = __decorate([
    __param(0, Inject(CommandEmitterService)),
    __param(1, Inject(StateService)),
    __param(2, Inject(IUndoRedoService)),
    __metadata("design:paramtypes", [CommandEmitterService,
        StateService, Object])
], SnapshotService);
export { SnapshotService };
//# sourceMappingURL=snapshot.service.js.map