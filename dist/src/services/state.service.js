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
import { Disposable, Inject, ObjectMatrix, ThemeService, mergeWorksheetSnapshotWithDefault, } from '@univerjs/core';
export class SheetState {
    constructor(sheetId, snapshot) {
        Object.defineProperty(this, "sheetId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: sheetId
        });
        Object.defineProperty(this, "snapshot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "matrix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "syncOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "computed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "newRowsData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        if (!snapshot)
            throw new Error('snapshot is required');
        this.snapshot = mergeWorksheetSnapshotWithDefault(snapshot);
        this.matrix = new ObjectMatrix(snapshot.cellData);
    }
    setState(nextState) {
        if (nextState.snapshot)
            Object.assign(this.snapshot, nextState.snapshot);
        if (nextState.syncOptions) {
            if (this.syncOptions)
                Object.assign(this.syncOptions, nextState.syncOptions);
            else {
                this.syncOptions = nextState.syncOptions;
            }
        }
        this.computed = this.calculateComputedOptions();
    }
    calculateComputedOptions() {
        const columns = this.syncOptions?.columns?.filter((a) => !a.innerHidden) ?? [];
        const rowOffset = this.syncOptions?.showHeader && columns?.length ? 1 : 0;
        return {
            columns,
            rowOffset,
        };
    }
    getCellDataByPos(target) {
        const i = target.row ?? -1;
        const j = target.col ?? target.column ?? -1;
        return this.snapshot?.cellData?.[i]?.[j];
    }
}
let StateService = class StateService extends Disposable {
    constructor(_themeService) {
        super();
        Object.defineProperty(this, "_themeService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _themeService
        });
        Object.defineProperty(this, "workbook", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * The state of the data synchronization.
         * key = [sheetId/subUnitId]
         */
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.disposeWithMe({
            dispose: () => {
                this.state = {};
            },
        });
    }
    getState(sheetId) {
        return this.state[sheetId];
    }
    get darkMode() {
        return this._themeService.darkMode;
    }
    getActiveSheetState() {
        const sheetId = this.workbook?.getActiveSheet().getSheetId();
        if (!sheetId)
            return undefined;
        return this.getState(sheetId);
    }
    setState(sheetId, state) {
        var _a;
        const newState = ((_a = this.state)[sheetId] ?? (_a[sheetId] = new SheetState(sheetId, state.snapshot)));
        newState.setState(state);
        return newState;
    }
};
StateService = __decorate([
    __param(0, Inject(ThemeService)),
    __metadata("design:paramtypes", [ThemeService])
], StateService);
export { StateService };
//# sourceMappingURL=state.service.js.map