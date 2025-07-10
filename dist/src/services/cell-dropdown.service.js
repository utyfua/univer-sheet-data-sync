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
import { CellValueType, Disposable, Inject, Workbook, } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { IEditorBridgeService, ISheetCellDropdownManagerService, SetCellEditVisibleOperation, } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import { CommandEmitterService } from './command-emitter.service';
import { StateService } from './state.service';
const BooleanDropdownOptions = [
    {
        label: 'TRUE',
        value: 'true',
    },
    {
        label: 'FALSE',
        value: 'false',
    },
];
let CellDropdownService = class CellDropdownService extends Disposable {
    constructor(workbook, _commandEmitter, _cellDropdownManager, _editorBridgeService, _stateService) {
        super();
        Object.defineProperty(this, "_commandEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _commandEmitter
        });
        Object.defineProperty(this, "_cellDropdownManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _cellDropdownManager
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
        Object.defineProperty(this, "_disposeDropdown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.disposeWithMe(_editorBridgeService.visible$.subscribe((val) => {
            this._disposeDropdown?.dispose();
            if (!val.visible) {
                this._disposeDropdown = undefined;
                return;
            }
            const editCellState = this._editorBridgeService.getEditCellState();
            const state = this._stateService.getActiveSheetState();
            if (!state || !editCellState)
                return;
            const cell = state.getCellDataByPos(editCellState);
            const dropdownOptions = cell?.syncRef?.().syncData?.dropdownOptions ??
                (cell?.t === CellValueType.BOOLEAN
                    ? BooleanDropdownOptions
                    : undefined);
            if (!cell || !dropdownOptions?.length)
                return;
            this._disposeDropdown = _cellDropdownManager.showDropdown({
                location: {
                    col: editCellState.column,
                    row: editCellState.row,
                    unitId: editCellState.unitId,
                    subUnitId: editCellState.sheetId,
                    workbook,
                    worksheet: workbook.getActiveSheet(),
                },
                closeOnOutSide: true,
                type: 'list',
                props: {
                    options: dropdownOptions,
                    defaultValue: cell.v + '',
                    onChange: (value) => {
                        this._commandEmitter.syncExecuteCommand(SetCellEditVisibleOperation, {
                            unitId: editCellState.unitId,
                            eventType: DeviceInputEventType.Keyboard,
                            visible: false,
                            keycode: KeyCode.ESC,
                        });
                        this._commandEmitter.syncExecuteCommand(SetRangeValuesCommand, {
                            unitId: editCellState.unitId,
                            subUnitId: editCellState.sheetId,
                            value: {
                                [editCellState.row]: {
                                    [editCellState.column]: {
                                        v: value[0],
                                    },
                                },
                            },
                        });
                        return true;
                    },
                },
            });
        }));
    }
};
CellDropdownService = __decorate([
    __param(1, Inject(CommandEmitterService)),
    __param(2, Inject(ISheetCellDropdownManagerService)),
    __param(3, Inject(IEditorBridgeService)),
    __param(4, Inject(StateService)),
    __metadata("design:paramtypes", [Workbook,
        CommandEmitterService, Object, Object, StateService])
], CellDropdownService);
export { CellDropdownService };
//# sourceMappingURL=cell-dropdown.service.js.map