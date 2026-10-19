import { describe, expect, it } from 'vitest';

import { CameraInterface } from '../camera/camera-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import {
  BarraPlanningInterface,
  RigaPlanningInterface,
  SpostamentoPlanningInterface,
} from './barra-planning-model';

describe('BarraPlanningInterface', () => {
  it('mette i soggiorni sulla riga della camera e ne descrive lo spostamento', () => {
    const prenotazione = { id: 7, codice: 'BB-7' } as PrenotazioneInterface;
    const camera = { id: 2, numero: '102' } as CameraInterface;
    const barra: BarraPlanningInterface = { da: 1, a: 4, prima: true, dopo: false, prenotazione };
    const riga: RigaPlanningInterface = { camera, barre: [barra] };
    const spostamento: SpostamentoPlanningInterface = {
      prenotazione,
      camera,
      data_arrivo: '2030-06-02',
      data_partenza: '2030-06-05',
    };

    expect(riga.barre[0].prenotazione).toBe(spostamento.prenotazione);
  });
});
