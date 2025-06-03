import {
  CellValue,
  CellValueType,
  Disposable,
  ICellData,
  IObjectArrayPrimitiveType,
  IStyleData,
  Inject,
  Nullable,
  ObjectMatrix,
} from '@univerjs/core'
import { SetRangeValuesMutation } from '@univerjs/sheets'
import {
  ICellDataWithSyncState,
  ICellSyncData,
  ICellSyncState,
  NewRowBase,
} from '../interfaces'
import { CommandEmitterService } from './command-emitter.service'
import { SnapshotService } from './snapshot.service'
import { SheetState, StateService } from './state.service'

const getCellRealValue = (cell: ICellSyncState): Nullable<CellValue> =>
  cell.isDefaultValue ? null : cell._ref.v

export const isRejectInvalidInput = (
  state: SheetState,
  cellState: ICellSyncState,
): boolean =>
  (state.syncOptions?.rejectInvalidInput &&
    cellState.column?.rejectInvalidInput !== false) ||
  cellState.column.rejectInvalidInput === true

export const buildCellData = (
  state: SheetState,
  i: number,
  j: number,
  isNewRow?: boolean,
  row?: unknown,
): ICellDataWithSyncState => {
  const cell: ICellDataWithSyncState = {
    syncRef: () => cellState,
  }
  let cellState: ICellSyncState
  const column = state.computed.columns[j]
  if (isNewRow) {
    const row = (state.newRowsData[i] ??=
      state.syncOptions?.freeRowDefault?.() ?? {})
    const syncData = column.extractNewCellData?.(row, column) ?? {}
    cellState = {
      _ref: cell,
      row,
      column,
      syncData,
      isNewRow: true,
    }
    cell.v = row[column.key!] ?? syncData.value
  } else {
    row ??= state.syncOptions?.data?.[i]
    const syncData = column.extractCellData(row, column)
    cellState = {
      _ref: cell,
      row,
      column,
      syncData,
    }
    cell.v = syncData.value
  }
  adjustCellData(state, cell)

  return cell
}

export const adjustCellData = (
  state: SheetState,
  cell: ICellDataWithSyncState,
  /**
   * undefined - if the cell is NOT being adjusted at all
   * true - if the cell is being adjusted during an undo operation
   * false - if the cell is being adjusted during a normal operation
   */
  isUndo?: boolean,
) => {
  const cellState = cell.syncRef?.()
  if (!cellState?.syncData) return

  const defaultValue = cellState.syncData.defaultValue
  if (defaultValue !== undefined && (cell.v === undefined || cell.v === null)) {
    cell.v = defaultValue
    cellState.isDefaultValue = true
  } else if (cellState.isDefaultValue && cell.v !== defaultValue) {
    cellState.isDefaultValue = false
  }

  if (typeof cell.v === 'object') cell.v = JSON.stringify(cell.v)

  const realValue = getCellRealValue(cellState)
  if (isUndo !== undefined) {
    if (!isRejectInvalidInput(state, cellState)) {
      cellState.validationError = cellState.column.validateCellValue?.(
        realValue,
        cellState,
      )
    }

    if (cellState.isNewRow) {
      cellState.row[cellState.column.key!] = realValue
    }
  }

  cell.t =
    cellState.syncData.type ??
    (typeof cell.v === 'number'
      ? CellValueType.NUMBER
      : typeof cell.v === 'boolean'
        ? CellValueType.BOOLEAN
        : undefined)

  const s = (
    !cell.s || typeof cell.s === 'object' ? (cell.s ??= {}) : (cell.s = {})
  ) as IStyleData

  if (cellState.isDefaultValue) {
    s.it = 1
    s.cl = { rgb: '#4472C4' }
  } else {
    delete s.it
    delete s.cl
  }

  if (cellState.validationError) {
    s.bg = { rgb: '#FFCDD2' }
  } else if (cellState.isPendingSave) {
    s.bg = { rgb: '#FAF3C0' }
  } else if (
    cellState.isNewRow &&
    realValue !== undefined &&
    realValue !== null
  ) {
    s.bg = { rgb: '#E3F2FD' }
  } else {
    delete s.bg
  }
}

export class CellValueService extends Disposable {
  private _isUndoActive: boolean = false

  constructor(
    @Inject(CommandEmitterService)
    readonly _commandEmitter: CommandEmitterService,
    @Inject(StateService) readonly _stateService: StateService,
    @Inject(SnapshotService) readonly _snapshotService: SnapshotService,
  ) {
    super()

    _commandEmitter.registerBeforeCommandExecuted('univer.command.undo', () => {
      this._isUndoActive = true
    })
    _commandEmitter.registerAfterCommandExecuted('univer.command.undo', () => {
      this._isUndoActive = false
    })

    _commandEmitter.registerAfterCommandExecuted(
      SetRangeValuesMutation,
      (commandInfo) => {
        const state = this._stateService.getActiveSheetState()
        if (!state) return

        const newRows: Record<number, NewRowBase> = {}

        const cellValue = new ObjectMatrix(commandInfo.params!.cellValue)
        cellValue.forValue((row, column, _cell) => {
          const cellState = state.getCellDataByPos({ row, column })?.syncRef?.()
          if (!cellState?.syncData) return

          adjustCellData(state, cellState._ref, this._isUndoActive)
          cellState.column.onCellValueChange?.(
            getCellRealValue(cellState),
            cellState,
          )

          if (cellState.isNewRow) {
            newRows[row] = cellState.row
          }
        })

        let snapshotModded = false
        for (const [snapshotRowIndex, row] of Object.entries(newRows)) {
          const snapshotRow = state.snapshot.cellData[snapshotRowIndex as any]
          const cells = Object.values<ICellDataWithSyncState>(
            snapshotRow as Record<string, ICellDataWithSyncState>,
          ).map((cell) => cell.syncRef!())
          const savedRow = state.syncOptions?.onNewRow?.(row, cells as any)
          if (!savedRow) continue
          const rowIndex = state.newRowsData.indexOf(row)
          if (rowIndex === -1) throw new Error('Row not found in new rows data')
          state.newRowsData.splice(rowIndex, 1)
          this._snapshotService.addNewFreeRow()
          snapshotModded = true
          if (savedRow === true) continue
          for (let i = 0; i < cells.length; i++) {
            snapshotRow[i] = buildCellData(state, 0, i, false, savedRow)
          }
        }

        if (snapshotModded) {
          this._commandEmitter.rerenderWorkbook()
        }
      },
    )
  }
}
