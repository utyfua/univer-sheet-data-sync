import {
  Disposable,
  IWorkbookData,
  Injector,
  Univer,
  UniverInstanceType,
  Workbook,
  generateRandomId,
} from '@univerjs/core'
import { IRenderManagerService } from '@univerjs/engine-render'
import { NewRowBase } from '../interfaces'
import { RenderExtension } from '../render'
import { CellDropdownService } from '../services/cell-dropdown.service'
import { CellPopupService } from '../services/cell-popup.service'
import { CellsProtectionService } from '../services/cell-protection.service'
import { CellValueService } from '../services/cell-value.service'
import { CommandEmitterService } from '../services/command-emitter.service'
import {
  IWorksheetDataPartial,
  SnapshotService,
} from '../services/snapshot.service'
import { StateService } from '../services/state.service'
import { TweakContextMenuService } from '../services/tweak-context-menu.service'
import { WorksheetSyncController } from './worksheet-sync.controller'

export class WorkbookSyncController extends Disposable {
  private _injector: Injector
  private _stateService: StateService
  private _snapshotService: SnapshotService
  private _worksheetMap: Map<string, WorksheetSyncController> = new Map()

  constructor(private _univer: Univer) {
    super()
    this._injector = _univer.__getInjector()
    _univer.onDispose(() => this.dispose())

    this._stateService = this.createDependency(StateService)
    this.createDependency(CommandEmitterService)
    this._snapshotService = this.createDependency(SnapshotService)
  }

  private createDependency<
    T extends unknown[],
    U extends unknown[],
    C extends Disposable,
  >(ctor: new (...args: [...T, ...U]) => C, ...customArgs: T): C {
    const instance = this._injector.createInstance(ctor, ...customArgs)
    this.disposeWithMe(instance)
    this._injector.add([ctor, instance])
    return instance
  }

  bootstrap(options?: Partial<Omit<IWorkbookData, 'sheetOrder' | 'sheets'>>) {
    const options2 = this._snapshotService.getBootstrapOptions(options)
    const workbook = (this._stateService.workbook = this._univer.createUnit<
      IWorkbookData,
      Workbook
    >(UniverInstanceType.UNIVER_SHEET, options2))

    const activeSheet = workbook.getActiveSheet().getSheetId()
    this.getWorksheetSyncController(activeSheet)?.setDataModel({})

    const renderManagerService = this._injector.get(IRenderManagerService)
    this.disposeWithMe(
      renderManagerService.registerRenderModule<any>(
        UniverInstanceType.UNIVER_SHEET,
        [RenderExtension],
      ),
    )

    this.createDependency(CellPopupService)
    this.createDependency(CellDropdownService, workbook)
    this.createDependency(CellsProtectionService)
    this.createDependency(CellValueService)
    this.createDependency(TweakContextMenuService, workbook)

    return workbook
  }

  addSheet<
    Row = unknown,
    NewRow extends NewRowBase | false = NewRowBase | false,
  >(worksheet: IWorksheetDataPartial): WorksheetSyncController<Row, NewRow> {
    const id = (worksheet.id ??= generateRandomId())
    let sheet = this.getWorksheetSyncController<Row, NewRow>(id)
    this._stateService.setState(id, { snapshot: worksheet })
    if (!sheet) {
      sheet = this._injector.createInstance(
        WorksheetSyncController<Row, NewRow>,
        id,
      )!
      this._worksheetMap.set(id, sheet as any as WorksheetSyncController)

      const workbook = this._stateService.workbook
      if (workbook) {
        const order = workbook.getSheets().length
        workbook.addWorksheet(id, order, worksheet)
      }
    }
    return sheet
  }

  getWorksheetSyncController<
    Row,
    NewRow extends NewRowBase | false = NewRowBase | false,
  >(id: string): WorksheetSyncController<Row, NewRow> | undefined {
    return this._worksheetMap.get(id) as
      | WorksheetSyncController<Row, NewRow>
      | undefined
  }
}
