import { type IScale, Inject } from '@univerjs/core'
import {
  SheetExtension,
  SpreadsheetSkeleton,
  UniverRenderingContext,
} from '@univerjs/engine-render'
import {
  PROTECTED_CELL_BASE64_DARK,
  PROTECTED_CELL_BASE64_LIGHT,
} from '../resources/protected-cell-base64'
import { StateService } from '../services/state.service'

export class ProtectedCellsRenderExtension extends SheetExtension {
  uKey = 'SHEET_DATA_SYNC_PROTECT_BACKGROUND'
  Z_INDEX = 25
  protected _img: Record<number, HTMLImageElement> = {}
  protected _pattern: Record<number, CanvasPattern | null> = {}

  constructor(@Inject(StateService) private _stateService: StateService) {
    super()

    const light = (this._img[0] = new Image())
    light.src = PROTECTED_CELL_BASE64_LIGHT
    const dark = (this._img[1] = new Image())
    dark.src = PROTECTED_CELL_BASE64_DARK
  }

  private applyFillStyle(ctx: UniverRenderingContext) {
    const isDarkMode = +this._stateService.darkMode
    let pattern = this._pattern[isDarkMode]

    if (!pattern) {
      const img = this._img[isDarkMode]
      pattern = this._pattern[isDarkMode] = ctx.createPattern(img, 'repeat')
    }

    ctx.fillStyle = pattern!
  }

  override draw(
    ctx: UniverRenderingContext,
    _parentScale: IScale,
    spreadsheetSkeleton: SpreadsheetSkeleton,
  ) {
    const { worksheet } = spreadsheetSkeleton
    const state = this._stateService.getState(worksheet.getSheetId())

    if (!worksheet || !state) {
      return
    }
    ctx.save()
    this.applyFillStyle(ctx)

    const fillCell = (row: number, column: number) => {
      if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(column))
        return
      const coords = spreadsheetSkeleton.getCellWithCoordByIndex(
        row,
        column,
        false,
      )
      ctx.fillRect(
        coords.startX,
        coords.startY,
        coords.endX - coords.startX,
        coords.endY - coords.startY,
      )
    }

    state.matrix.forValue((row, column, data) => {
      const syncData = data.syncRef?.().syncData
      if (!syncData || syncData?.isProtected) {
        fillCell(row, column)
      }
    })

    ctx.restore()
  }
}
