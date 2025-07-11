import {
  CellValue,
  CellValueType,
  ICellData,
  IDisposable,
  Nullable,
} from '@univerjs/core'

export interface ICellSyncData {
  value?: CellValue
  defaultValue?: CellValue
  /**
   * Cell Value Type
   *
   * The type of the cell value.
   */
  type?: CellValueType
  /**
   * Protected
   *
   * Disables editing of the cell.
   */
  isProtected?: boolean
  dropdownOptions?: readonly {
    label: string
    value: string | number
    color?: string
  }[]
}

export interface ICellDataWithSyncState extends Omit<ICellData, 'custom'> {
  // function to prevent deep copying of the sync data
  syncRef?: () => ICellSyncState
}

export type NewRowBase = Record<string, Nullable<CellValue>>

export type ICellSyncState<
  Row = unknown,
  NewRow extends object | false = NewRowBase | false,
> = {
  /**
   * @inner
   */
  _ref: ICellDataWithSyncState
  column: IColumn<Row, NewRow>
  syncData: ICellSyncData
  isDefaultValue?: boolean
  isPendingSave?: boolean
  validationError?: boolean | string
} & (
  | {
      isNewRow: true
      row: NewRow extends object ? NewRow : never
    }
  | {
      isNewRow?: false
      row: Row
    }
)

export type IColumn<
  Row = unknown,
  NewRow extends object | false = NewRowBase | false,
> = {
  innerHidden?: boolean
  displayName?: string
  rejectInvalidInput?: boolean
  width?: number
  extractCellData: (row: Row, column: IColumn<Row, NewRow>) => ICellSyncData
  extractNewCellData?: (
    row: NewRow,
    column: IColumn<Row, NewRow>,
  ) => ICellSyncData
  validateCellValue?: (
    value: Nullable<CellValue>,
    cell: ICellSyncState<Row, NewRow>,
  ) => boolean | string | undefined
  onCellValueChange?: (
    value: Nullable<CellValue>,
    cell: ICellSyncState<Row, NewRow>,
  ) => void
} & (NewRow extends object
  ? {
      key: keyof NewRow
    }
  : {
      key?: string
    })

export type ISyncOptions<
  Row = unknown,
  NewRow extends object | false = NewRowBase | false,
> = {
  columns?: IColumn<Row, NewRow>[]
  showHeader?: boolean
  rejectInvalidInput?: boolean
  // accumulateChanges?: boolean
  getRowKey?: (row: Row) => string
  data?: Row[]
  onActiveListener?: () => IDisposable | void
} & (NewRow extends object
  ? {
      freeRows?: number
      freeRowDefault?: () => NewRow
      /**
       * Callback when a new row is tried to be filled by data. Triggered each time related cell is changed.
       * Will be called even if `validateCellValue` rejects any of the cells.
       *
       * If it returns false or undefined, the new row will be kept in the free rows.
       *
       * If it returns true, the new row will be removed from new rows.
       * Its expected to be added to the data via `setDataModel`.
       *
       * If it returns a Row, the new row will be kept on its place but will be treated as a regular row.
       *
       * Do not return true or Row if `accumulateChanges` is active.
       */
      onNewRow?: (
        row: NewRow,
        cells: ICellSyncState<Row, NewRow>[],
      ) => void | false | Row
    }
  : {
      freeRows?: undefined
      freeRowDefault?: undefined
      onNewRow?: undefined
    })
