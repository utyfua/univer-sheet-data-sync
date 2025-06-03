import { Disposable, Inject, Injector } from '@univerjs/core'
import {
  IRenderContext,
  IRenderModule,
  Spreadsheet,
} from '@univerjs/engine-render'
import { ProtectedCellsRenderExtension } from './protected-cells.render'

export class RenderExtension extends Disposable implements IRenderModule {
  constructor(
    private readonly _context: IRenderContext,
    @Inject(Injector) protected readonly _injector: Injector,
  ) {
    super()

    const mainComponent = this._context.mainComponent as Spreadsheet | null
    if (!mainComponent)
      throw new Error('Main component is not defined in the render context')

    const protectedCells = this._injector.createInstance(
      ProtectedCellsRenderExtension,
    )

    this.disposeWithMe(mainComponent.register(protectedCells))
  }

  // private _initRender(spreadsheetRender: Spreadsheet): void {
  //   this.disposeWithMe(spreadsheetRender.register(this._renderExtension))
  // }
}
