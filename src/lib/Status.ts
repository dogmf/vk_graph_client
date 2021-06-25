import _ from "lodash";

export type StatusPing = { text: string; percent: number };
export type StatusPingFunction = (prop: StatusPing) => void;
export class Status {
  _t = "";
  _p = 0;
  callback?: StatusPingFunction;
  constructor(callback?: StatusPingFunction) {
    this.callback = callback;
  }
  t(t: string) {
    this._t = t;
    return this;
  }
  p(p: number) {
    this._p = p;
    return this;
  }
  tick = _.throttle(() => {
    if (this.callback) this.callback({ text: this._t, percent: this._p });
  }, 300);
}
