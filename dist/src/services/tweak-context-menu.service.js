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
import { Disposable, IPermissionService, Inject, Workbook, } from '@univerjs/core';
import { WorkbookCreateProtectPermission, WorkbookCreateSheetPermission, WorkbookDeleteSheetPermission, WorkbookHideSheetPermission, WorkbookRenameSheetPermission, } from '@univerjs/sheets';
import { RemoveSheetConfirmCommand, RenameSheetOperation, } from '@univerjs/sheets-ui';
import { IMenuManagerService } from '@univerjs/ui';
const WhitelistMenuActions = [
    'sheet.command.copy',
    'sheet.command.paste',
    // 'sheet.menu.paste-special',
    RemoveSheetConfirmCommand.id,
    RenameSheetOperation.id,
    'sheet.command.set-col-auto-width',
    'sheet.command.set-row-is-auto-height',
    'sheet.command.toggle-gridlines',
    'doc.command.copy',
    'univer.command.cut',
];
let TweakContextMenuService = class TweakContextMenuService extends Disposable {
    constructor(workbook, _menuManagerService, _permissionService) {
        super();
        Object.defineProperty(this, "workbook", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: workbook
        });
        Object.defineProperty(this, "_menuManagerService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _menuManagerService
        });
        Object.defineProperty(this, "_permissionService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _permissionService
        });
        this.applyContextMenu();
        this.applyPermissions();
    }
    applyContextMenu() {
        const { _menuManagerService: service } = this;
        // @ts-expect-error
        const menuState = service._menu;
        if (!menuState)
            throw new Error('menuState is undefined');
        // drop entire level if no items is whitelisted
        const checkLevel = (obj, l = 0) => {
            let isNN = false;
            for (const key in obj) {
                if (key === 'order')
                    continue;
                if (WhitelistMenuActions.includes(key)) {
                    isNN = true;
                    continue;
                }
                if (obj[key].menuItemFactory) {
                    delete obj[key];
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const res = checkLevel(obj[key], l + 1);
                    if (!res) {
                        if (l >= 2)
                            delete obj[key];
                    }
                    else
                        isNN = true;
                }
            }
            return isNN;
        };
        checkLevel(menuState);
        // @ts-expect-error
        if (!service.menuChanged$?.next)
            throw new Error('menuChanged$ is undefined');
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        service.menuChanged$.next();
    }
    setWorkbookPermissionPoint(unitId, FPointClass, value) {
        const instance = new FPointClass(unitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }
        this._permissionService.updatePermissionPoint(instance.id, value);
    }
    applyPermissions() {
        const unitId = this.workbook.getUnitId();
        this.setWorkbookPermissionPoint(unitId, WorkbookCreateSheetPermission, false);
        this.setWorkbookPermissionPoint(unitId, WorkbookDeleteSheetPermission, false);
        this.setWorkbookPermissionPoint(unitId, WorkbookRenameSheetPermission, false);
        this.setWorkbookPermissionPoint(unitId, WorkbookHideSheetPermission, false);
        this.setWorkbookPermissionPoint(unitId, WorkbookCreateProtectPermission, false);
    }
};
TweakContextMenuService = __decorate([
    __param(1, Inject(IMenuManagerService)),
    __param(2, IPermissionService),
    __metadata("design:paramtypes", [Workbook, Object, Object])
], TweakContextMenuService);
export { TweakContextMenuService };
//# sourceMappingURL=tweak-context-menu.service.js.map