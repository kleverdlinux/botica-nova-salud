export class ErrorNegocio extends Error {
  constructor(mensaje, statusCode = 400) {
    super(mensaje);
    this.name = 'ErrorNegocio';
    this.statusCode = statusCode;
  }
}
