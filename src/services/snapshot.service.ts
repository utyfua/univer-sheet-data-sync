import {
  CellValueType,
  Disposable,
  IDisposable,
  IUndoRedoService,
  IWorkbookData,
  IWorksheetData,
  Inject,
  generateRandomId,
} from '@univerjs/core'
import { ISyncOptions } from '../interfaces'
import { buildCellData } from './cell-value.service'
import { CommandEmitterService } from './command-emitter.service'
import { StateService } from './state.service'

export type IWorksheetDataPartial = Partial<
  Omit<IWorksheetData, 'rowCount' | 'columnCount' | 'cellData'>
>

export class SnapshotService extends Disposable {
  private _activeSheetListener:
    | {
        listener: () => void | IDisposable
        disposable?: IDisposable | void
      }
    | undefined

  constructor(
    @Inject(CommandEmitterService)
    readonly _commandEmitter: CommandEmitterService,
    @Inject(StateService) readonly _stateService: StateService,
    @Inject(IUndoRedoService) readonly _undoRedoService: IUndoRedoService,
  ) {
    super()

    this.disposeWithMe({
      dispose: () => {
        this._activeSheetListener?.disposable?.dispose()
      },
    })

    this._commandEmitter.registerAfterCommandExecuted(
      'sheet.operation.set-worksheet-active',
      this.syncActiveSheetListener.bind(this),
    )
  }

  getBootstrapOptions(
    options?: Partial<Omit<IWorkbookData, 'sheetOrder' | 'sheets'>>,
  ): Partial<IWorkbookData> {
    options ??= {}
    options.id ??= generateRandomId()
    options.name ??= 'default'
    options.appVersion ??= ''
    options.styles ??= {}

    return {
      ...options,
      sheetOrder: Object.keys(this._stateService.state),
      sheets: Object.fromEntries(
        Object.entries(this._stateService.state).map(([id, state]) => [
          id,
          state.snapshot,
        ]),
      ),
    }
  }

  getSheetById(id: string) {
    return this._stateService.workbook
      ?.getSheets()
      .find((s) => s.getSheetId() === id)
  }

  upsertUniverWorksheet(worksheet: IWorksheetDataPartial): string {
    const id = worksheet.id ?? generateRandomId()
    const snapshot = this._stateService.getState(id)!.snapshot

    const workbook = this._stateService.workbook
    workbook?.addWorksheet(id, workbook.getSheetOrders().length, snapshot)

    this._commandEmitter.rerenderWorkbook()

    return id
  }

  setWorksheetSyncDataModel(worksheetId: string, syncOptions: ISyncOptions) {
    const newState = this._stateService.setState(worksheetId, {
      syncOptions,
    })
    const snapshot = newState.snapshot
    syncOptions = newState.syncOptions ?? {}

    let { columns, rowOffset } = newState.computed
    columns?.forEach((column, i) => {
      if (column.width === snapshot.columnData[i]?.w) return
      snapshot.columnData[i] ??= {}
      snapshot.columnData[i].w = column.width
    })

    snapshot.columnCount = columns?.length || 1
    snapshot.rowCount =
      (syncOptions?.data?.length || 0) +
        (syncOptions.freeRows || 0) +
        rowOffset || 1

    const cellMatrix = snapshot.cellData
    if (rowOffset) {
      const cellRow = (cellMatrix[0] ??= [])
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i]
        cellRow[i] = {
          v: column.displayName || '',
          t: CellValueType.STRING,
          s: { bl: 1 },
        }
        if (syncOptions.freeRows && !column.key) {
          throw new Error(
            `Column ${column.displayName ?? ''} must have a key to be used in free rows.`,
          )
        }
      }
    }

    if (syncOptions.data?.length) {
      for (let i = 0; i < syncOptions.data.length; i++) {
        const cellRow = (cellMatrix[i + rowOffset] ??= [])
        for (let j = 0; j < columns.length; j++) {
          cellRow[j] = buildCellData(newState, i, j)
        }
      }
      rowOffset += syncOptions.data.length
    }

    if (syncOptions.freeRows) {
      for (let i = 0; i < syncOptions.freeRows; i++) {
        const cellRow = (cellMatrix[i + rowOffset] ??= [])
        for (let j = 0; j < columns.length; j++) {
          cellRow[j] = buildCellData(newState, i, j, true)
        }
      }
    }

    const workbook = this._stateService.workbook
    if (workbook) {
      this._undoRedoService.clearUndoRedo(workbook.getUnitId())
      this._commandEmitter.rerenderWorkbook()
      this.syncActiveSheetListener()
    }
  }

  private syncActiveSheetListener() {
    const state = this._stateService.getActiveSheetState()
    const nextListener = state?.syncOptions?.onActiveListener
    if (this._activeSheetListener?.listener === nextListener) return
    this._activeSheetListener?.disposable?.dispose()
    if (!nextListener) this._activeSheetListener = undefined
    else {
      this._activeSheetListener = {
        listener: nextListener,
      }
      this._activeSheetListener.disposable = nextListener()
    }
  }

  addNewFreeRow() {
    const state = this._stateService.getActiveSheetState()
    if (!state) return
    const snapshot = state.snapshot
    const cellRow = (snapshot.cellData[snapshot.rowCount++] ??= [])
    const i = state.newRowsData.length
    const columns = state.computed.columns
    for (let j = 0; j < columns.length; j++) {
      cellRow[j] = buildCellData(state, i, j, true)
    }
  }
}
