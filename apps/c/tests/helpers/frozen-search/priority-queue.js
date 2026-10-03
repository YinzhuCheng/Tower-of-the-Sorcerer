export class MaxPriorityQueue {
  constructor() {
    this.heap = [];
    this.serial = 0;
  }

  push(value, priority = 0) {
    const node = { value, priority: Number(priority) || 0, serial: this.serial++ };
    this.heap.push(node);
    this.#bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.#bubbleDown(0);
    }
    return top.value;
  }

  get size() {
    return this.heap.length;
  }

  #isHigher(a, b) {
    return a.priority > b.priority || (a.priority === b.priority && a.serial < b.serial);
  }

  #bubbleUp(index) {
    let cursor = index;
    while (cursor > 0) {
      const parent = Math.floor((cursor - 1) / 2);
      if (this.#isHigher(this.heap[parent], this.heap[cursor])) break;
      [this.heap[parent], this.heap[cursor]] = [this.heap[cursor], this.heap[parent]];
      cursor = parent;
    }
  }

  #bubbleDown(index) {
    let cursor = index;
    while (true) {
      const left = cursor * 2 + 1;
      const right = left + 1;
      let best = cursor;
      if (left < this.heap.length && this.#isHigher(this.heap[left], this.heap[best])) best = left;
      if (right < this.heap.length && this.#isHigher(this.heap[right], this.heap[best])) best = right;
      if (best === cursor) return;
      [this.heap[cursor], this.heap[best]] = [this.heap[best], this.heap[cursor]];
      cursor = best;
    }
  }
}
