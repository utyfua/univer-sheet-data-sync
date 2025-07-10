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
import { Disposable, Inject } from '@univerjs/core';
import { SnapshotService, } from '../services/snapshot.service';
import { StateService } from '../services/state.service';
let WorksheetSyncController = class WorksheetSyncController extends Disposable {
    constructor(id, _snapshotService, _stateService) {
        super();
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "_snapshotService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _snapshotService
        });
        Object.defineProperty(this, "_stateService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _stateService
        });
    }
    updateUniverWorksheet(worksheet) {
        worksheet.id = this.id;
        this._snapshotService.upsertUniverWorksheet(worksheet);
    }
    setDataModel(syncOptions) {
        this._snapshotService.setWorksheetSyncDataModel(this.id, syncOptions);
    }
    getDataModel() {
        return this._stateService.getState(this.id)?.syncOptions;
    }
};
WorksheetSyncController = __decorate([
    __param(1, Inject(SnapshotService)),
    __param(2, Inject(StateService)),
    __metadata("design:paramtypes", [String, SnapshotService,
        StateService])
], WorksheetSyncController);
export { WorksheetSyncController };
//# sourceMappingURL=worksheet-sync.controller.js.map