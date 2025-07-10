import { Disposable, IPermissionService, Workbook } from '@univerjs/core';
import { IMenuManagerService } from '@univerjs/ui';
export declare class TweakContextMenuService extends Disposable {
    private workbook;
    private readonly _menuManagerService;
    protected readonly _permissionService: IPermissionService;
    constructor(workbook: Workbook, _menuManagerService: IMenuManagerService, _permissionService: IPermissionService);
    private applyContextMenu;
    private setWorkbookPermissionPoint;
    private applyPermissions;
}
