class Node<T> {
  public t: number;
  public keys: T[];
  public children: Node<T>[];
  public isLeaf: boolean;

  public constructor(t: number) {
    this.t = t;
    this.keys = [];
    this.children = [];
    this.isLeaf = false;
  }

  public search(k: T): [Node<T>, number] | null {
    let i = 0;
    while (i < this.keys.length && k > this.keys[i]) {
      i++;
    }
    if (i < this.keys.length && k == this.keys[i]) {
      return [this, i];
    }
    if (this.isLeaf) {
      return null;
    }
    return this.children[i].search(k);
  }

  public splitChild(i: number): void {
    const t = this.t;

    const right = new Node<T>(t - 1);
    const left = this.children[i];
    right.isLeaf = left.isLeaf;
    right.keys = left.keys.slice(t);
    if (!left.isLeaf) {
      right.children = left.children.slice(t);
    }

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
      if (c.keys.length == 2 * this.t - 1) {
        this.splitChild(i);
        if (k > this.keys[i]) c = this.children[i + 1];
      }
      c.insertNonfull(k);
    }
  }
}

export class BTree<T> {
  private t: number;
  private root: Node<T>;

  public constructor(t: number) {
    this.t = t;
    this.root = new Node<T>(t);
    this.root.isLeaf = true;
  }

  public insert(k: T): void {
    const t = this.t;
    const r = this.root;

    if (r.keys.length == 2 * t - 1) {
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
}
