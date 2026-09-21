/**
 * The slice of the Barcode Detection API the join scanner uses.
 *
 * Shipped by Chromium and by Safari 17+, absent from Firefox — hence
 * `BarcodeDetector` being declared optional on `Window`. Callers must feature
 * detect before constructing one; there is no polyfill behind this.
 */
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(source: CanvasImageSource | Blob): Promise<DetectedBarcode[]>;
}

interface Window {
  BarcodeDetector?: typeof BarcodeDetector;
}
