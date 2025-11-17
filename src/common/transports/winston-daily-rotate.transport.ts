import Transport from 'winston-transport';
import * as FileStreamRotator from 'file-stream-rotator';
import * as path from 'path';

interface DailyRotateTransportOptions {
  dirname: string;         // logs directory
  filename: string;        // e.g. "app-%DATE%.log"
  datePattern?: string;    // default: YYYY-MM-DD
  level?: string;          // log level
}

export class DailyRotateTransport extends Transport {
  private stream: any;

  constructor(options: DailyRotateTransportOptions) {
    super(options);

    const {
      dirname,
      filename,
      datePattern = 'YYYY-MM-DD',
    } = options;

    this.stream = FileStreamRotator.getStream({
      filename: path.join(dirname, filename),
      frequency: 'daily',
      date_format: datePattern,
      verbose: false,
    });
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));
    this.stream.write(JSON.stringify(info) + '\n');
    callback();
  }
}
