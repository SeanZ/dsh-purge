const REWIND_CSS = `
.dshp-rewind-wrap{position:relative;display:inline-flex}
.dshp-rewind{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.dshp-rewind:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.dshp-rewind:disabled{opacity:.4;cursor:default}
.dshp-rewind svg{display:block}
.dshp-rewind-menu{position:absolute;right:0;bottom:calc(100% + 6px);z-index:100;box-sizing:border-box;min-width:196px;padding:4px;border:0;border-radius:12px;background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary,#1a1a1a);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.16))}
body[data-ds-dark-theme] .dshp-rewind-menu{background:var(--dsw-specific-menu,#32312d);color:var(--dsw-alias-label-primary,#e6e2db);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1,#3f3d38);box-shadow:var(--dsw-elevation-prominent,0 10px 28px rgba(0,0,0,.45))}
.dshp-rewind-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer;font:12px/1.3 var(--ds-font-sans,system-ui,sans-serif)}
.dshp-rewind-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dshp-rewind-item b{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dshp-rewind-item span{color:var(--dsw-alias-label-tertiary,#9a958c);font-size:11px}
body[data-ds-dark-theme] .dshp-rewind-item span{color:var(--dsw-alias-label-tertiary,#a8a39a)}
.dshp-continue{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.dshp-continue:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.dshp-continue:disabled{opacity:.4;cursor:default}
.dshp-continue.is-ready{color:var(--dsw-alias-label-primary,currentColor)}
.dshp-continue svg{display:block}
`;

export { REWIND_CSS };
