import {
  CellValueType,
  Disposable,
  IDisposable,
  Inject,
  Workbook,
} from '@univerjs/core'
import { DeviceInputEventType } from '@univerjs/engine-render'
import { SetRangeValuesCommand } from '@univerjs/sheets'
import {
  IEditorBridgeService,
  ISheetCellDropdownManagerService,
  SetCellEditVisibleOperation,
} from '@univerjs/sheets-ui'
import type { IListDropdownProps } from '@univerjs/sheets-ui/lib/types/views/dropdown/list-dropdown/index.js'
import { KeyCode } from '@univerjs/ui'
import { CommandEmitterService } from './command-emitter.service'
import { StateService } from './state.service'

const BooleanDropdownOptions = [
  {
    label: 'TRUE',
    value: 'true',
  },
  {
    label: 'FALSE',
    value: 'false',
  },
]

export class CellDropdownService extends Disposable {
  private _disposeDropdown: IDisposable | undefined

  constructor(
    workbook: Workbook,
    @Inject(CommandEmitterService)
    readonly _commandEmitter: CommandEmitterService,
    @Inject(ISheetCellDropdownManagerService)
    readonly _cellDropdownManager: ISheetCellDropdownManagerService,
    @Inject(IEditorBridgeService)
    readonly _editorBridgeService: IEditorBridgeService,
    @Inject(StateService) readonly _stateService: StateService,
  ) {
    super()

    this.disposeWithMe(
      _editorBridgeService.visible$.subscribe((val) => {
        this._disposeDropdown?.dispose()
        if (!val.visible) {
          this._disposeDropdown = undefined
          return
        }

        const editCellState = this._editorBridgeService.getEditCellState()
        const state = this._stateService.getActiveSheetState()
        if (!state || !editCellState) return

        const cell = state.getCellDataByPos(editCellState)
        const dropdownOptions =
          cell?.syncRef?.().syncData?.dropdownOptions ??
          (cell?.t === CellValueType.BOOLEAN
            ? BooleanDropdownOptions
            : undefined)
        if (!cell || !dropdownOptions?.length) return

        this._disposeDropdown = _cellDropdownManager.showDropdown({
          location: {
            col: editCellState.column,
            row: editCellState.row,
            unitId: editCellState.unitId,
            subUnitId: editCellState.sheetId,
            workbook,
            worksheet: workbook.getActiveSheet(),
          },
          closeOnOutSide: true,
          type: 'list',
          props: {
            options: dropdownOptions as IListDropdownProps['options'],
            defaultValue: cell.v + '',
            onChange: (value) => {
              this._commandEmitter.syncExecuteCommand(
                SetCellEditVisibleOperation,
                {
                  unitId: editCellState.unitId,
                  eventType: DeviceInputEventType.Keyboard,
                  visible: false,
                  keycode: KeyCode.ESC,
                },
              )
              this._commandEmitter.syncExecuteCommand(SetRangeValuesCommand, {
                unitId: editCellState.unitId,
                subUnitId: editCellState.sheetId,
                value: {
                  [editCellState.row]: {
                    [editCellState.column]: {
                      v: value[0],
                    },
                  },
                },
              })
              return true
            },
          },
        })
      }),
    )
  }
}
