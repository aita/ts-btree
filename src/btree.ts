class Node<T> {
  public t: number;
  public keys: T[];
  public children: Node<T>[];
  public isLeaf: boolean;

  public constructor(t: number, isLeaf = false) {
    this.t = t;
    this.isLeaf = isLeaf;
    this.keys = [];
    this.children = [];
  }

  public isFull(): boolean {
    return this.keys.length == 2 * this.t - 1;
  }

  public search(k: T): [Node<T>, number] | null {
    let i = 0;
    while (i < this.keys.length && k > this.keys[i]) i++;
    if (i < this.keys.length && k == this.keys[i]) return [this, i];
    if (this.isLeaf) return null;
    return this.children[i].search(k);
  }

  public splitChild(i: number): void {
    const t = this.t;

    const left = this.children[i];
    const right = new Node<T>(t - 1, left.isLeaf);
    right.keys = left.keys.slice(t);
    if (!left.isLeaf) right.children = left.children.slice(t);

    this.children.splice(i + 1, 0, right);
    this.keys.splice(i, 0, left.keys[t - 1]);

    left.keys = left.keys.slice(0, t - 1);
    left.children = left.children.slice(0, t);
  }

  public insertNonfull(k: T): void {
    if (this.isLeaf) {
      let i = 0;
      for (; i < this.keys.length; i++) {
        if (k < this.keys[i]) break;
      }
      this.keys.splice(i, 0, k);
    } else {
      let i = 0;
      for (; i < this.keys.length; i++) {
        if (k < this.keys[i]) break;
      }
      let c = this.children[i];
      if (c.isFull()) {
        this.splitChild(i);
        if (k > this.keys[i]) c = this.children[i + 1];
      }
      c.insertNonfull(k);
    }
  }

  public delete(k: T): void {
    const t = this.t;
    if (this.isLeaf) {
      // 1
      const i = this.keys.indexOf(k);
      if (i >= 0) this.keys.splice(i, 1);
      return;
    }

    if (this.keys.includes(k)) {
      // 2
      const i = this.keys.indexOf(k);
      const y = this.children[i];
      const z = this.children[i + 1];
      if (y.keys.length >= t) {
        // 2a
        const k2 = y.keys[y.pred(k)];
        y.delete(k2);
        this.keys[i] = k2;
        return;
      } else if (z.keys.length >= t) {
        // 2b
        const k2 = z.keys[z.succ(k)];
        z.delete(k2);
        this.keys[i] = k2;
        return;
      } else {
        // 2c
        this.keys.splice(i, 1);
        y.keys.push(k);
        y.keys = y.keys.concat(z.keys);
        this.children.splice(i + 1, 1);
        y.delete(k);
        return;
      }
    } else {
      const i = this.succ(k);
      const c = this.children[i];
      if (c.keys.length >= t) {
        c.delete(k);
        return;
      } else {
        const left = i > 0 ? this.children[i - 1] : null;
        const right = i < this.keys.length ? this.children[i + 1] : null;
        if (left && left.t >= t) {
          // 3a left
          const k2 = this.keys[i];
          c.keys.unshift(k2);
          this.keys[i] = left.keys[left.keys.length - 1];
          left.keys.pop();
        } else if (right && right.t >= t) {
          // 3a right
          const k2 = this.keys[i];
          c.keys.push(k2);
          this.keys[i] = right.keys[0];
          right.keys.shift();
        } else {
          // 3b
          if (left) {
            this.keys.splice(i, 1);
            left.keys.push(k);
            c.keys = left.keys.concat(c.keys);
            this.children.splice(i - 1, 1);
          } else if (right) {
            this.keys.splice(i, 1);
            c.keys.push(k);
            c.keys = c.keys.concat(right.keys);
            this.children.splice(i + 1, 1);
          }
        }
        c.delete(k);
        return;
      }
    }
  }

  private succ(k: T): number {
    let j = 0;
    for (; j < this.keys.length; j++) {
      if (k < this.keys[j]) break;
    }
    return j;
  }

  private pred(k: T): number {
    let j = this.keys.length - 1;
    for (; j >= 0; j--) {
      if (k > this.keys[j]) break;
    }
    return j;
  }
}

export class BTree<T> {
  private t: number;
  private root: Node<T>;

  public constructor(t: number) {
    this.t = t;
    this.root = new Node<T>(t, true);
  }

  public insert(k: T): void {
    const t = this.t;
    const r = this.root;
    if (r.isFull()) {
      const s = new Node<T>(t);
      this.root = s;
      s.children.push(r);
      s.splitChild(0);
      s.insertNonfull(k);
    } else {
      r.insertNonfull(k);
    }
  }

  public search(k: T): T | null {
    const found = this.root.search(k);
    if (found) {
      const node = found[0];
      const i = found[1];
      return node.keys[i];
    } else {
      return null;
    }
  }

  public delete(k: T): void {
    this.root.delete(k);
    if (this.root.keys.length == 0) {
      this.root = this.root.children[0];
    }
  }
}
