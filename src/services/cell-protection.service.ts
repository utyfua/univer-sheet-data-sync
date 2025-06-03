import {
  CustomCommandExecutionError,
  Disposable,
  Inject,
  ObjectMatrix,
} from '@univerjs/core'
import { ISheetLocationBase, SetRangeValuesMutation } from '@univerjs/sheets'
import {
  IEditorBridgeService,
  SetCellEditVisibleOperation,
} from '@univerjs/sheets-ui'
import { CellPopupService } from './cell-popup.service'
import { isRejectInvalidInput } from './cell-value.service'
import { CommandEmitterService } from './command-emitter.service'
import { StateService } from './state.service'

export class CellsProtectionService extends Disposable {
  constructor(
    @Inject(CommandEmitterService)
    readonly _commandEmitter: CommandEmitterService,
    @Inject(IEditorBridgeService)
    readonly _editorBridgeService: IEditorBridgeService,
    @Inject(StateService) readonly _stateService: StateService,
    @Inject(CellPopupService) readonly _cellPopup: CellPopupService,
  ) {
    super()

    this._commandEmitter.registerBeforeCommandExecuted(
      SetCellEditVisibleOperation,
      (commandInfo) => {
        if (!commandInfo.params?.visible) return
        this.handleProtectedCellCheck()
      },
    )
    this._commandEmitter.registerBeforeCommandExecuted(
      [
        'doc.command.insert-text',
        'doc.command.delete-text',
        'doc.command.delete-left',
        'doc.command.delete-right',
      ],
      this.handleProtectedCellCheck.bind(this),
    )

    _commandEmitter.registerBeforeCommandExecuted(
      SetRangeValuesMutation,
      (commandInfo) => {
        const state = this._stateService.getActiveSheetState()
        if (!state) return

        const cellValue = new ObjectMatrix(commandInfo.params!.cellValue)
        cellValue.forValue((row, column, cell) => {
          const location: ISheetLocationBase = {
            col: column,
            row: row,
            unitId: commandInfo.params!.unitId,
            subUnitId: commandInfo.params!.subUnitId,
          }
          if (cell?.f) {
            this._cellPopup.showFormulaRejectPopup(location)
            throw new CustomCommandExecutionError('Formula Cell')
          }
          const cellState = state.getCellDataByPos(location)?.syncRef?.()
          if (!cellState?.syncData || cellState.syncData?.isProtected) {
            this._cellPopup.showProtectedPopup(location)
            throw new CustomCommandExecutionError('Protected Cell')
          }
          if (isRejectInvalidInput(state, cellState)) {
            const isInvalid = cellState.column?.validateCellValue?.(
              cell?.v,
              cellState,
            )
            if (isInvalid) {
              this._cellPopup.showInvalidPopup(location, isInvalid)
              throw new CustomCommandExecutionError('Invalid Cell')
            }
          }
        })
      },
    )
  }

  private handleProtectedCellCheck() {
    const editCellState = this._editorBridgeService.getEditCellState()
    const state = this._stateService.getActiveSheetState()
    if (!state || !editCellState) return

    const syncData = state.getCellDataByPos(editCellState)?.syncRef?.().syncData
    if (syncData && !syncData?.isProtected) return

    this._cellPopup.showProtectedPopup({
      col: editCellState.column,
      row: editCellState.row,
      unitId: editCellState.unitId,
      subUnitId: editCellState.sheetId,
    })
    throw new CustomCommandExecutionError(
      'You are not allowed to perform this action',
    )
  }
}
