import { Component, Input, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import SignaturePad from 'signature_pad'; // Import correct
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas width="600" height="200" style="border: 1px solid #ccc;"></canvas>`,
})
export class SignatureWrapperComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() options: Partial<SignaturePad> = {};

  private signaturePad!: SignaturePad;

  ngAfterViewInit(): void {
    const canvasEl = this.canvas.nativeElement;
    this.signaturePad = new SignaturePad(canvasEl, this.options);
  }

  clear(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  toDataURL(): string {
    return this.signaturePad.toDataURL();
  }

  fromDataURL(dataUrl: string): void {
    this.signaturePad.fromDataURL(dataUrl);
  }

  isEmpty(): boolean {
    return this.signaturePad.isEmpty();
  }
}
