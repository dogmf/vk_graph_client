type AsyncFunction = () => Promise<any>;

export class Sequencer {
  limit = 25;
  current = 0;

  callbacks: AsyncFunction[] = [];

  async run(cb: AsyncFunction) {
    return new Promise<any>((res) => {
      this.callbacks.push(async () => {
        res(await cb());
      });
      this.try();
    });
  }

  async try() {
    if (this.current < this.limit && this.callbacks.length > 0) {
      this.current++;
      let cb = this.callbacks.shift();
      if (cb) await cb();
      this.current--;
      this.try();
    }
  }
}
