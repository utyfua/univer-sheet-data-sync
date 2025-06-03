import {
  Disposable,
  IPermissionService,
  Inject,
  Workbook,
  WorkbookPermissionPointConstructor,
} from '@univerjs/core'
import {
  WorkbookCreateProtectPermission,
  WorkbookCreateSheetPermission,
  WorkbookDeleteSheetPermission,
  WorkbookHideSheetPermission,
  WorkbookRenameSheetPermission,
} from '@univerjs/sheets'
import {
  RemoveSheetConfirmCommand,
  RenameSheetOperation,
} from '@univerjs/sheets-ui'
import { IMenuManagerService } from '@univerjs/ui'

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
]

export class TweakContextMenuService extends Disposable {
  constructor(
    private workbook: Workbook,
    @Inject(IMenuManagerService)
    private readonly _menuManagerService: IMenuManagerService,
    @IPermissionService
    protected readonly _permissionService: IPermissionService,
  ) {
    super()
    this.applyContextMenu()
    this.applyPermissions()
  }

  private applyContextMenu() {
    const { _menuManagerService: service } = this

    // @ts-expect-error
    const menuState = service._menu
    if (!menuState) throw new Error('menuState is undefined')

    // drop entire level if no items is whitelisted
    const checkLevel = (obj: any, l = 0): any => {
      let isNN = false
      for (const key in obj) {
        if (key === 'order') continue
        if (WhitelistMenuActions.includes(key)) {
          isNN = true
          continue
        }
        if (obj[key].menuItemFactory) {
          delete obj[key]
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const res = checkLevel(obj[key], l + 1)
          if (!res) {
            if (l >= 2) delete obj[key]
          } else isNN = true
        }
      }
      return isNN
    }
    checkLevel(menuState)

    // @ts-expect-error
    if (!service.menuChanged$?.next)
      throw new Error('menuChanged$ is undefined')
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    service.menuChanged$.next()
  }

  private setWorkbookPermissionPoint(
    unitId: string,
    FPointClass: WorkbookPermissionPointConstructor,
    value: boolean,
  ): void {
    const instance = new FPointClass(unitId)
    const permissionPoint = this._permissionService.getPermissionPoint(
      instance.id,
    )
    if (!permissionPoint) {
      this._permissionService.addPermissionPoint(instance)
    }
    this._permissionService.updatePermissionPoint(instance.id, value)
  }

  private applyPermissions() {
    const unitId = this.workbook.getUnitId()
    this.setWorkbookPermissionPoint(
      unitId,
      WorkbookCreateSheetPermission,
      false,
    )
    this.setWorkbookPermissionPoint(
      unitId,
      WorkbookDeleteSheetPermission,
      false,
    )
    this.setWorkbookPermissionPoint(
      unitId,
      WorkbookRenameSheetPermission,
      false,
    )
    this.setWorkbookPermissionPoint(unitId, WorkbookHideSheetPermission, false)
    this.setWorkbookPermissionPoint(
      unitId,
      WorkbookCreateProtectPermission,
      false,
    )
  }
}
