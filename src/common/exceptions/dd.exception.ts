export class DdException extends Error {
  public readonly ddHtml: string;

  constructor(html: string) {
    super('DD_EXCEPTION'); // optional message
    this.ddHtml = html;

    // Set the prototype explicitly (important for instanceof)
    Object.setPrototypeOf(this, DdException.prototype);
  }
}
