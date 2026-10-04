import { describe, expect, it } from 'vitest';

import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { DataBloccataInterface } from '../../../shared/models/data-bloccata/data-bloccata-model';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import {
  barreChiusure,
  giorniPeriodo,
  periodoPlanning,
  righePlanning,
  spostaSoggiorno,
} from './planning';

describe('planning', () => {
  const periodo = periodoPlanning('2030-06-01', 7);

  it('fa un periodo di n giorni con una colonna per giorno', () => {
    expect(periodo).toEqual({ dal: '2030-06-01', al: '2030-06-08' });
    expect(giorniPeriodo(periodo)).toEqual([
      '2030-06-01',
      '2030-06-02',
      '2030-06-03',
      '2030-06-04',
      '2030-06-05',
      '2030-06-06',
      '2030-06-07',
    ]);
  });

  it('mette soggiorni e chiusure sulle colonne, tagliandoli sul periodo', () => {
    const dentro = { data_arrivo: '2030-06-02', data_partenza: '2030-06-04' };
    const aCavallo = { data_arrivo: '2030-05-30', data_partenza: '2030-06-10' };
    const chiusura = { data_inizio: '2030-06-07', data_fine: '2030-06-09' };
    const camera = {
      id: 1,
      prenotazioni: [dentro, aCavallo] as PrenotazioneInterface[],
      date_bloccate: [chiusura] as DataBloccataInterface[],
    } as CameraInterface;

    const [riga] = righePlanning([camera], periodo);

    expect(riga.camera).toBe(camera);
    expect(riga.barre).toEqual([
      { da: 2, a: 4, prima: false, dopo: false, prenotazione: dentro },
      { da: 1, a: 8, prima: true, dopo: true, prenotazione: aCavallo },
      { da: 7, a: 8, prima: false, dopo: true, chiusura },
    ]);
  });

  it('una camera senza soggiorni ha la riga vuota', () => {
    expect(righePlanning([{ id: 2 } as CameraInterface], periodo)[0].barre).toEqual([]);
    expect(barreChiusure([], periodo)).toEqual([]);
  });

  it('sposta il soggiorno mantenendo le notti', () => {
    expect(spostaSoggiorno({ data_arrivo: '2030-06-30', data_partenza: '2030-07-02' }, 2)).toEqual({
      data_arrivo: '2030-07-02',
      data_partenza: '2030-07-04',
    });
  });
});
