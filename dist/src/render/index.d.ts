import { Disposable, Injector } from '@univerjs/core';
import { IRenderContext, IRenderModule } from '@univerjs/engine-render';
export declare class RenderExtension extends Disposable implements IRenderModule {
    private readonly _context;
    protected readonly _injector: Injector;
    constructor(_context: IRenderContext, _injector: Injector);
}
