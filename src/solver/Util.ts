export default class Util {
  //Moves
  static Ux1 = 0;
  static Ux2 = 1;
  static Ux3 = 2;
  static Rx1 = 3;
  static Rx2 = 4;
  static Rx3 = 5;
  static Fx1 = 6;
  static Fx2 = 7;
  static Fx3 = 8;
  static Dx1 = 9;
  static Dx2 = 10;
  static Dx3 = 11;
  static Lx1 = 12;
  static Lx2 = 13;
  static Lx3 = 14;
  static Bx1 = 15;
  static Bx2 = 16;
  static Bx3 = 17;

  //Facelets
  static U1 = 0;
  static U2 = 1;
  static U3 = 2;
  static U4 = 3;
  static U5 = 4;
  static U6 = 5;
  static U7 = 6;
  static U8 = 7;
  static U9 = 8;
  static R1 = 9;
  static R2 = 10;
  static R3 = 11;
  static R4 = 12;
  static R5 = 13;
  static R6 = 14;
  static R7 = 15;
  static R8 = 16;
  static R9 = 17;
  static F1 = 18;
  static F2 = 19;
  static F3 = 20;
  static F4 = 21;
  static F5 = 22;
  static F6 = 23;
  static F7 = 24;
  static F8 = 25;
  static F9 = 26;
  static D1 = 27;
  static D2 = 28;
  static D3 = 29;
  static D4 = 30;
  static D5 = 31;
  static D6 = 32;
  static D7 = 33;
  static D8 = 34;
  static D9 = 35;
  static L1 = 36;
  static L2 = 37;
  static L3 = 38;
  static L4 = 39;
  static L5 = 40;
  static L6 = 41;
  static L7 = 42;
  static L8 = 43;
  static L9 = 44;
  static B1 = 45;
  static B2 = 46;
  static B3 = 47;
  static B4 = 48;
  static B5 = 49;
  static B6 = 50;
  static B7 = 51;
  static B8 = 52;
  static B9 = 53;

  //Colors
  static U = 0;
  static R = 1;
  static F = 2;
  static D = 3;
  static L = 4;
  static B = 5;

  static CornerFacelet = [
    [Util.U9, Util.R1, Util.F3],
    [Util.U7, Util.F1, Util.L3],
    [Util.U1, Util.L1, Util.B3],
    [Util.U3, Util.B1, Util.R3],
    [Util.D3, Util.F9, Util.R7],
    [Util.D1, Util.L9, Util.F7],
    [Util.D7, Util.B9, Util.L7],
    [Util.D9, Util.R9, Util.B7],
  ];
  static EdgeFacelet = [
    [Util.U6, Util.R2],
    [Util.U8, Util.F2],
    [Util.U4, Util.L2],
    [Util.U2, Util.B2],
    [Util.D6, Util.R8],
    [Util.D2, Util.F8],
    [Util.D4, Util.L8],
    [Util.D8, Util.B8],
    [Util.F6, Util.R4],
    [Util.F4, Util.L6],
    [Util.B6, Util.L4],
    [Util.B4, Util.R6],
  ];

  static MOVE2STR = [
    "U ",
    "U2",
    "U'",
    "R ",
    "R2",
    "R'",
    "F ",
    "F2",
    "F'",
    "D ",
    "D2",
    "D'",
    "L ",
    "L2",
    "L'",
    "B ",
    "B2",
    "B'",
  ];

  static UD2STD = [
    Util.Ux1,
    Util.Ux2,
    Util.Ux3,
    Util.Rx2,
    Util.Fx2,
    Util.Dx1,
    Util.Dx2,
    Util.Dx3,
    Util.Lx2,
    Util.Bx2,
    Util.Rx1,
    Util.Rx3,
    Util.Fx1,
    Util.Fx3,
    Util.Lx1,
    Util.Lx3,
    Util.Bx1,
    Util.Bx3,
  ];

  static STD2UD: number[] = ((): number[] => {
    const result: number[] = [];
    for (let i = 0; i < 18; i++) {
      result[Util.UD2STD[i]] = i;
    }
    return result;
  })();

  static CKMV2BIT: number[] = ((): number[] => {
    const result: number[] = [];
    for (let i = 0; i < 10; i++) {
      const ix = ~~(Util.UD2STD[i] / 3);
      result[i] = 0;
      for (let j = 0; j < 10; j++) {
        const jx = ~~(Util.UD2STD[j] / 3);
        result[i] |= (ix == jx || (ix % 3 == jx % 3 && ix >= jx) ? 1 : 0) << j;
      }
    }
    result[10] = 0;
    return result;
  })();

  static Cnk: number[][] = ((): number[][] => {
    const ret: number[][] = [];
    const fact: number[] = [1];
    for (let i = 0; i < 13; i++) {
      ret[i] = [];
      fact[i + 1] = fact[i] * (i + 1);
      ret[i][0] = ret[i][i] = 1;
      for (let j = 1; j < 13; j++) {
        ret[i][j] = j <= i ? ret[i - 1][j - 1] + ret[i - 1][j] : 0;
      }
    }
    return ret;
  })();

  static Fact: number[] = ((): number[] => {
    const ret = [1];
    for (let i = 0; i < 13; i++) {
      ret[i + 1] = ret[i] * (i + 1);
    }
    return ret;
  })();

  static GetNParity(idx: number, n: number): number {
    let p = 0;
    for (let i = n - 2; i >= 0; i--) {
      p ^= idx % (n - i);
      idx = ~~(idx / (n - i));
    }
    return p & 1;
  }

  static SetVal(src: number, dst: number, edge: boolean): number {
    return edge ? (dst << 1) | (src & 1) : dst | (src & 0xf8);
  }

  static GetVal(src: number, edge: boolean): number {
    return edge ? src >> 1 : src & 7;
  }

  static SetNPerm(arr: number[], idx: number, n: number, edge: boolean): void {
    n--;
    let val = 0x76543210;
    for (let i = 0; i < n; ++i) {
      const p = Util.Fact[n - i];
      let v = ~~(idx / p);
      idx %= p;
      v <<= 2;
      arr[i] = Util.SetVal(arr[i], (val >> v) & 0xf, edge);
      const m = (1 << v) - 1;
      val = (val & m) + ((val >> 4) & ~m);
    }
    arr[n] = Util.SetVal(arr[n], val & 0xf, edge);
  }

  static GetNPerm(arr: number[], n: number, edge: boolean): number {
    let idx = 0,
      val = 0x76543210;
    for (let i = 0; i < n - 1; ++i) {
      const v = Util.GetVal(arr[i], edge) << 2;
      idx = (n - i) * idx + ((val >> v) & 0xf);
      val -= 0x11111110 << v;
    }
    return idx;
  }

  static SetNPermFull(arr: number[], idx: number, n: number, edge: boolean): void {
    arr[n - 1] = Util.SetVal(arr[n - 1], 0, edge);
    for (let i = n - 2; i >= 0; --i) {
      arr[i] = Util.SetVal(arr[i], idx % (n - i), edge);
      idx = ~~(idx / (n - i));
      for (let j = i + 1; j < n; ++j) {
        if (Util.GetVal(arr[j], edge) >= Util.GetVal(arr[i], edge)) {
          arr[j] = Util.SetVal(arr[j], Util.GetVal(arr[j], edge) + 1, edge);
        }
      }
    }
  }

  static GetNPermFull(arr: number[], n: number, edge: boolean): number {
    let idx = 0;
    for (let i = 0; i < n; ++i) {
      idx *= n - i;
      for (let j = i + 1; j < n; ++j) {
        if (Util.GetVal(arr[j], edge) < Util.GetVal(arr[i], edge)) {
          ++idx;
        }
      }
    }
    return idx;
  }

  static GetComb(arr: number[], mask: number, edge: boolean): number {
    const end = arr.length - 1;
    let value = 0,
      r = 4;
    for (let i = end; i >= 0; i--) {
      const perm = Util.GetVal(arr[i], edge);
      if ((perm & 0xc) == mask) {
        value += Util.Cnk[i][r--];
      }
    }
    return value;
  }

  static SetComb(arr: number[], value: number, mask: number, edge: boolean): void {
    const end = arr.length - 1;
    let r = 4,
      fill = end;
    for (let i = end; i >= 0; i--) {
      if (value >= Util.Cnk[i][r]) {
        value -= Util.Cnk[i][r--];
        arr[i] = Util.SetVal(arr[i], r | mask, edge);
      } else {
        if ((fill & 0xc) == mask) {
          fill -= 4;
        }
        arr[i] = Util.SetVal(arr[i], fill--, edge);
      }
    }
  }
}
