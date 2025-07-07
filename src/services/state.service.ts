import {
  CellValue,
  Disposable,
  IObjectMatrixPrimitiveType,
  IWorksheetData,
  Inject,
  Nullable,
  ObjectMatrix,
  ThemeService,
  Workbook,
  mergeWorksheetSnapshotWithDefault,
} from '@univerjs/core'
import {
  ICellDataWithSyncState,
  IColumn,
  ISyncOptions,
  NewRowBase,
} from '../interfaces'

interface ComputedOptions {
  columns: IColumn[]
  rowOffset: number
}

export class SheetState {
  snapshot: Omit<IWorksheetData, 'cellData'> & {
    cellData: IObjectMatrixPrimitiveType<ICellDataWithSyncState>
  }
  matrix: ObjectMatrix<Nullable<ICellDataWithSyncState>>
  syncOptions?: ISyncOptions
  computed!: ComputedOptions
  newRowsData: NewRowBase[] = []

  constructor(
    public sheetId: string,
    snapshot?: Partial<IWorksheetData>,
  ) {
    if (!snapshot) throw new Error('snapshot is required')
    this.snapshot = mergeWorksheetSnapshotWithDefault(snapshot)
    this.matrix = new ObjectMatrix(snapshot.cellData)
  }

  setState(nextState: IState) {
    if (nextState.snapshot) Object.assign(this.snapshot, nextState.snapshot)
    if (nextState.syncOptions) {
      if (this.syncOptions)
        Object.assign(this.syncOptions, nextState.syncOptions)
      else {
        this.syncOptions = nextState.syncOptions
      }
    }
    this.computed = this.calculateComputedOptions()
  }

  private calculateComputedOptions(): ComputedOptions {
    const columns =
      this.syncOptions?.columns?.filter((a) => !a.innerHidden) ?? []
    const rowOffset = this.syncOptions?.showHeader && columns?.length ? 1 : 0
    return {
      columns,
      rowOffset,
    }
  }

  getCellDataByPos(target: {
    row: number
    col: number
  }): ICellDataWithSyncState | undefined
  getCellDataByPos(target: {
    row: number
    column: number
  }): ICellDataWithSyncState | undefined
  getCellDataByPos(target: {
    row: number
    col?: number
    column?: number
  }): ICellDataWithSyncState | undefined {
    const i = target.row ?? -1
    const j = target.col ?? target.column ?? -1
    return this.snapshot?.cellData?.[i]?.[j]
  }
}

type IState = {
  syncOptions?: ISyncOptions
  snapshot?: Partial<IWorksheetData>
}

export class StateService extends Disposable {
  workbook: Workbook | undefined
  /**
   * The state of the data synchronization.
   * key = [sheetId/subUnitId]
   */
  state: Record<string, SheetState> = {}

  constructor(@Inject(ThemeService) private _themeService: ThemeService) {
    super()

    this.disposeWithMe({
      dispose: () => {
        this.state = {}
      },
    })
  }

  getState(sheetId: string): SheetState | undefined {
    return this.state[sheetId]
  }

  get darkMode(): boolean {
    return this._themeService.darkMode
  }

  getActiveSheetState() {
    const sheetId = this.workbook?.getActiveSheet().getSheetId()
    if (!sheetId) return undefined
    return this.getState(sheetId)
  }

  setState(sheetId: string, state: IState): SheetState {
    const newState = (this.state[sheetId] ??= new SheetState(
      sheetId,
      state.snapshot,
    ))
    newState.setState(state)
    return newState
  }
}
