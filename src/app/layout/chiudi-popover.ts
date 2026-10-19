/**
 * Chiude il menu a cassetto dopo la scelta di una voce. Il menu del gestionale
 * da desktop è sempre visibile senza essere aperto come popover: nessun effetto.
 */
export function chiudiPopover(menu: HTMLElement): void {
  if (menu.matches(':popover-open')) {
    menu.hidePopover();
  }
}
