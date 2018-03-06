

export function stayAlive() {
  (function wait() {
    setTimeout(wait, 10000);
  })();
}
