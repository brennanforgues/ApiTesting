export class TimeSpan {
  private static _empty: TimeSpan = new TimeSpan(0);
  constructor(public milliseconds: number) {}

  static fromMilliseconds(milliseconds: number) {
    return new TimeSpan(milliseconds);
  }

  static fromSeconds(seconds: number) {
    return new TimeSpan(seconds * 1000);
  }

  static fromMinutes(minutes: number) {
    return new TimeSpan(minutes * 60000);
  }

  static fromHours(hours: number) {
    return new TimeSpan(hours * 3600000);
  }

  static fromDays(days: number) {
    return new TimeSpan(days * 86400000);
  }

  static get empty() {
    return this._empty;
  }

  totalMilliseconds() {
    return this.milliseconds;
  }

  totalSeconds() {
    return this.milliseconds / 1000;
  }

  totalMinutes() {
    return this.milliseconds / 60000;
  }

  totalHours() {
    return this.milliseconds / 3600000;
  }

  totalDays() {
    return this.milliseconds / 86400000;
  }

  format(fmt: string): string {
    let hours = Math.floor(this.totalHours());
    let minutes = Math.floor(this.totalMinutes()) % 60;
    let seconds = Math.floor(this.totalSeconds()) % 60;
    let millis = Math.floor(this.milliseconds) % 1000;

    return fmt.replace("hh", String(hours).padStart(2, "0")).replace("mm", String(minutes).padStart(2, "0")).replace("ss", String(seconds).padStart(2, "0")).replace("fff", String(millis).padStart(3, "0"));
  }
}

export class Stopwatch {
  private startTime: number;
  private elapsedTime: TimeSpan;

  constructor() {
    this.startTime = 0;
    this.elapsedTime = TimeSpan.empty;
  }

  start() {
    if (this.startTime !== 0) {
      throw new Error("Stopwatch has already started.");
    }
    this.startTime = Date.now();
  }

  static start() {
    const sw = new Stopwatch();
    sw.start();
    return sw;
  }

  stop() {
    this.elapsedTime = this.elapsed();
    this.startTime = 0;
  }

  reset() {
    this.startTime = 0;
    this.elapsedTime = TimeSpan.empty;
  }

  elapsed() {
    if (this.startTime === 0) {
      throw new Error("Stopwatch is not started.");
    }
    let endTime = Date.now();
    const elapsedTime = new TimeSpan(endTime - this.startTime);
    return elapsedTime;
  }

  restart() {
    this.reset();
    this.start();
  }

  elapsedMilliseconds() {
    if (this.elapsedTime === TimeSpan.empty) {
      throw new Error("No elapsed time calculated. Make sure to start the stopwatch first.");
    }
    return this.elapsedTime.totalMilliseconds();
  }

  elapsedSeconds() {
    if (this.elapsedTime === TimeSpan.empty) {
      throw new Error("No elapsed time calculated. Make sure to start the stopwatch first.");
    }
    return this.elapsedTime.totalSeconds();
  }
}
