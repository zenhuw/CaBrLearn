import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

import { Amount, CustomUnit, Unit, unitMapping } from '../@core/models/substances.model';
import { GlobalModel } from '../@core/models/global.model';
import { Header } from '../@core/interfaces/Header';
import { LocalizedStrings } from '../@core/services/i18n/i18n.service';
import { ProviderMapping } from '../@core/services/provider/provider.model';
import { ProviderService } from '../@core/services/provider/provider.service';

// TODO ViewSubstanceData and move
interface SimpleSubstanceData {
  name: string;
  cas?: string;
  molecularFormula?: string;
  molarMass?: string;
  meltingPoint?: string;
  boilingPoint?: string;
  waterHazardClass?: string;
  hPhrases: [string, string][];
  pPhrases: [string, string][];
  signalWord?: string;
  symbols: string[];
  lethalDose?: string;
  mak?: string;
  amount?: Amount;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  strings!: LocalizedStrings;

  header!: Header;

  substanceData!: SimpleSubstanceData[];
  providerMapping!: ProviderMapping;

  sources: Set<string> = new Set();

  constructor(public globals: GlobalModel, private providerService: ProviderService) {
    this.globals.localizedStringsObservable.subscribe((strings) => (this.strings = strings));

    this.providerService.providerMappingsObservable.subscribe((providers) => (this.providerMapping = providers));
  }

  ngOnInit(): void {
    this.globals.headerObservable.subscribe((value) => (this.header = value));

    this.globals.substanceDataObservable
      .pipe(
        map((data) =>
          data.map<SimpleSubstanceData>((value) => {
            const provider = this.providerMapping.get(value.source.provider);
            if (provider && provider.identifier !== 'custom') {
              this.sources.add(provider.name);
            }

            return {
              name: value.name.modifiedData ?? value.name.originalData,
              cas: value.cas.modifiedData ?? value.cas.originalData,
              molecularFormula: value.molecularFormula.modifiedData ?? value.molecularFormula.originalData,
              molarMass: value.molarMass.modifiedData ?? value.molarMass.originalData,
              meltingPoint: value.meltingPoint.modifiedData ?? value.meltingPoint.originalData,
              boilingPoint: value.boilingPoint.modifiedData ?? value.boilingPoint.originalData,
              waterHazardClass: value.waterHazardClass.modifiedData ?? value.waterHazardClass.originalData,
              hPhrases: value.hPhrases.modifiedData ?? value.hPhrases.originalData,
              pPhrases: value.pPhrases.modifiedData ?? value.pPhrases.originalData,
              signalWord: value.signalWord.modifiedData ?? value.signalWord.originalData,
              symbols: value.symbols.modifiedData ?? value.symbols.originalData,
              lethalDose: value.lethalDose.modifiedData ?? value.lethalDose.originalData,
              mak: value.mak.modifiedData ?? value.mak.originalData,
              amount: value.amount,
            };
          }),
        ),
        map((substances) => {
          for (let i = substances.length; i < 5; i++) {
            substances.push({
              name: '',
              cas: '',
              molecularFormula: '',
              molarMass: '',
              meltingPoint: '',
              boilingPoint: '',
              waterHazardClass: '',
              hPhrases: [],
              pPhrases: [],
              signalWord: '',
              symbols: [],
              lethalDose: '',
              mak: '',
            });
          }
          return substances;
        }),
      )
      .subscribe((data) => (this.substanceData = data));
  }

  getPhraseNumber(phrases: [string, string][]): string[] {
    return phrases.map((p) => p[0]);
  }

  getHPhrases(): Set<string> {
    const phraseSet = new Set<string>();
    this.substanceData.flatMap((data) => data.hPhrases).forEach((phrase) => phraseSet.add(phrase.join(':\u00A0')));
    return phraseSet;
  }

  getPPhrases(): Set<string> {
    const phraseSet = new Set<string>();
    this.substanceData.flatMap((data) => data.pPhrases).forEach((phrase) => phraseSet.add(phrase.join(':\u00A0')));
    return phraseSet;
  }

  getProviders(): string {
    return Array.from(this.sources.values()).join(', ');
  }

  unitToString(unit?: Unit | CustomUnit): string {
    // if unit is undefined the type is object
    if (typeof unit === 'object') {
      if (unit !== null) {
        return (unit as CustomUnit).name;
      }
      return '';
    }

    // unit must be defined because of the check above
    const name = unitMapping.get(unit as Unit);
    if (name) {
      return name;
    }

    // should never occur, just for completeness
    throw new Error(`unknown unit: ${unit}`);
  }
}
