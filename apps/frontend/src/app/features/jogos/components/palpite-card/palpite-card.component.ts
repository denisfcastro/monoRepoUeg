import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Palpite } from '@repo/utils';

@Component({
  selector: 'app-palpite-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      (click)="!disabled() && select.emit()"
      [ngClass]="{
        'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/30': selected(),
        'border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-700 hover:bg-slate-900': !selected() && !disabled(),
        'opacity-50 cursor-not-allowed border-slate-900 bg-slate-950 text-slate-500': disabled()
      }"
      class="border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition duration-300 w-full"
    >
      <span class="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2">Sugerido</span>
      <div class="flex items-center space-x-3">
        <span class="text-2xl font-black">{{ palpite().golsCasa }}</span>
        <span class="text-slate-500 text-sm font-bold">X</span>
        <span class="text-2xl font-black">{{ palpite().golsVisitante }}</span>
      </div>
      <div class="mt-3 bg-emerald-900/40 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20">
        {{ palpite().odd | number:'1.2-2' }}x
      </div>
    </button>
  `,
})
export class PalpiteCardComponent {
  palpite = input.required<Palpite>();
  selected = input<boolean>(false);
  disabled = input<boolean>(false);
  
  select = output<void>();
}
