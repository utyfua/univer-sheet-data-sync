import { Disposable, UniverInstanceType, generateRandomId, } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RenderExtension } from '../render';
import { CellDropdownService } from '../services/cell-dropdown.service';
import { CellPopupService } from '../services/cell-popup.service';
import { CellsProtectionService } from '../services/cell-protection.service';
import { CellValueService } from '../services/cell-value.service';
import { CommandEmitterService } from '../services/command-emitter.service';
import { SnapshotService, } from '../services/snapshot.service';
import { StateService } from '../services/state.service';
import { TweakContextMenuService } from '../services/tweak-context-menu.service';
import { WorksheetSyncController } from './worksheet-sync.controller';
export class WorkbookSyncController extends Disposable {
    constructor(_univer) {
        super();
        Object.defineProperty(this, "_univer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _univer
        });
        Object.defineProperty(this, "_injector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_stateService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_snapshotService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_worksheetMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this._injector = _univer.__getInjector();
        _univer.onDispose(() => this.dispose());
        this._stateService = this.createDependency(StateService);
        this.createDependency(CommandEmitterService);
        this._snapshotService = this.createDependency(SnapshotService);
    }
    createDependency(ctor, ...customArgs) {
        const instance = this._injector.createInstance(ctor, ...customArgs);
        this.disposeWithMe(instance);
        this._injector.add([ctor, instance]);
        return instance;
    }
    bootstrap(options) {
        const options2 = this._snapshotService.getBootstrapOptions(options);
        const workbook = (this._stateService.workbook = this._univer.createUnit(UniverInstanceType.UNIVER_SHEET, options2));
        const activeSheet = workbook.getActiveSheet().getSheetId();
        this.getWorksheetSyncController(activeSheet)?.setDataModel({});
        const renderManagerService = this._injector.get(IRenderManagerService);
        this.disposeWithMe(renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [RenderExtension]));
        this.createDependency(CellPopupService);
        this.createDependency(CellDropdownService, workbook);
        this.createDependency(CellsProtectionService);
        this.createDependency(CellValueService);
        this.createDependency(TweakContextMenuService, workbook);
        return workbook;
    }
    addSheet(worksheet) {
        const id = (worksheet.id ?? (worksheet.id = generateRandomId()));
        let sheet = this.getWorksheetSyncController(id);
        this._stateService.setState(id, { snapshot: worksheet });
        if (!sheet) {
            sheet = this._injector.createInstance((WorksheetSyncController), id);
            this._worksheetMap.set(id, sheet);
            const workbook = this._stateService.workbook;
            if (workbook) {
                const order = workbook.getSheets().length;
                workbook.addWorksheet(id, order, worksheet);
            }
        }
        return sheet;
    }
    getWorksheetSyncController(id) {
        return this._worksheetMap.get(id);
    }
}
//# sourceMappingURL=workbook-sync.controller.js.map