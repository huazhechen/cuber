import CubieCube from "./CubieCube";
import Util from "./Util";

export default class CoordCube {
  static N_MOVES = 18;
  static N_MOVES2 = 10;
  static N_SLICE = 495;
  static N_TWIST = 2187;
  static N_TWIST_SYM = 324;
  static N_FLIP = 2048;
  static N_FLIP_SYM = 336;
  static N_PERM = 40320;
  static N_PERM_SYM = 2768;
  static N_MPERM = 24;
  static N_COMB = 70;
  static P2_PARITY_MOVE = 0;

  //XMove = Move Table
  //XPrun = Pruning Table
  //XConj = Conjugate Table

  //phase1
  static UDSliceMove: number[][] = [];
  static TwistMove: number[][] = [];
  static FlipMove: number[][] = [];
  static UDSliceConj: number[][] = [];

  static UDSliceTwistPrun: number[] = [];
  static UDSliceFlipPrun: number[] = [];

  //phase2
  static CPermMove: number[][] = [];
  static EPermMove: number[][] = [];
  static MPermMove: number[][] = [];
  static MPermConj: number[][] = [];
  static CCombPMove: number[][] = [];
  static CCombPConj: number[][] = [];
  static MCPermPrun: number[] = [];
  static EPermCCombPPrun: number[] = [];

  twist = 0;
  tsym = 0;
  flip = 0;
  fsym = 0;
  slice = 0;
  prun = 0;

  static inited = 0;

  static Init(): void {
    if (CoordCube.inited == 46) {
      return;
    }
    if (CoordCube.inited == 0) {
      CoordCube.CubieC = new CubieCube();
      CoordCube.CubieD = new CubieCube();
      CubieCube.InitPermSym2Raw();
      CoordCube.InitCPermMove();
      CoordCube.InitEPermMove();
      CoordCube.InitMPermMoveConj();
      CoordCube.InitCombPMoveConj();

      CubieCube.InitFlipSym2Raw();
      CubieCube.InitTwistSym2Raw();
      CoordCube.InitFlipMove();
      CoordCube.InitTwistMove();
      CoordCube.InitUDSliceMoveConj();
      CoordCube.inited = 1;
      return;
    }
    CoordCube.InitMCPermPrun();
    CoordCube.InitEPermCombPPrun();
    CoordCube.InitSliceTwistPrun();
    CoordCube.InitSliceFlipPrun();
  }

  static CubieC: CubieCube;
  static CubieD: CubieCube;

  static InitCPermMove(): void {
    for (let i = 0; i < CoordCube.N_PERM_SYM; i++) {
      CoordCube.CPermMove[i] = [];
      CoordCube.CubieC.CPerm = CubieCube.EPermS2R[i];
      for (let j = 0; j < CoordCube.N_MOVES2; j++) {
        CubieCube.CornMult(CoordCube.CubieC, CubieCube.MoveCube[Util.UD2STD[j]], CoordCube.CubieD);
        CoordCube.CPermMove[i][j] = CoordCube.CubieD.CPermSym;
      }
    }
  }

  static InitEPermMove(): void {
    for (let i = 0; i < CoordCube.N_PERM_SYM; i++) {
      CoordCube.EPermMove[i] = [];
      CoordCube.CubieC.EPerm = CubieCube.EPermS2R[i];
      for (let j = 0; j < CoordCube.N_MOVES2; j++) {
        CubieCube.EdgeMult(CoordCube.CubieC, CubieCube.MoveCube[Util.UD2STD[j]], CoordCube.CubieD);
        CoordCube.EPermMove[i][j] = CoordCube.CubieD.EPermSym;
      }
    }
  }

  static InitMPermMoveConj(): void {
    for (let i = 0; i < CoordCube.N_MPERM; i++) {
      CoordCube.MPermMove[i] = [];
      CoordCube.MPermConj[i] = [];
      CoordCube.CubieC.MPerm = i;
      for (let j = 0; j < CoordCube.N_MOVES2; j++) {
        CubieCube.EdgeMult(CoordCube.CubieC, CubieCube.MoveCube[Util.UD2STD[j]], CoordCube.CubieD);
        CoordCube.MPermMove[i][j] = CoordCube.CubieD.MPerm;
      }
      for (let j = 0; j < 16; j++) {
        CubieCube.EdgeConjugate(CoordCube.CubieC, CubieCube.SymMultInv[0][j], CoordCube.CubieD);
        CoordCube.MPermConj[i][j] = CoordCube.CubieD.MPerm;
      }
    }
  }

  static InitCombPMoveConj(): void {
    for (let i = 0; i < CoordCube.N_COMB; i++) {
      CoordCube.CCombPMove[i] = [];
      CoordCube.CCombPConj[i] = [];
      CoordCube.CubieC.CComb = i % 70;
      for (let j = 0; j < CoordCube.N_MOVES2; j++) {
        CubieCube.CornMult(CoordCube.CubieC, CubieCube.MoveCube[Util.UD2STD[j]], CoordCube.CubieD);
        CoordCube.CCombPMove[i][j] = CoordCube.CubieD.CComb + 70 * (((CoordCube.P2_PARITY_MOVE >> j) & 1) ^ (i / 70));
      }
      for (let j = 0; j < 16; j++) {
        CubieCube.CornConjugate(CoordCube.CubieC, CubieCube.SymMultInv[0][j], CoordCube.CubieD);
        CoordCube.CCombPConj[i][j] = CoordCube.CubieD.CComb + 70 * ~~(i / 70);
      }
    }
  }

  static InitFlipMove(): void {
    for (let i = 0; i < CoordCube.N_FLIP_SYM; i++) {
      CoordCube.FlipMove[i] = [];
      CoordCube.CubieC.Flip = CubieCube.FlipS2R[i];
      for (let j = 0; j < CoordCube.N_MOVES; j++) {
        CubieCube.EdgeMult(CoordCube.CubieC, CubieCube.MoveCube[j], CoordCube.CubieD);
        CoordCube.FlipMove[i][j] = CoordCube.CubieD.FlipSym;
      }
    }
  }

  static InitTwistMove(): void {
    for (let i = 0; i < CoordCube.N_TWIST_SYM; i++) {
      CoordCube.TwistMove[i] = [];
      CoordCube.CubieC.Twist = CubieCube.TwistS2R[i];
      for (let j = 0; j < CoordCube.N_MOVES; j++) {
        CubieCube.CornMult(CoordCube.CubieC, CubieCube.MoveCube[j], CoordCube.CubieD);
        CoordCube.TwistMove[i][j] = CoordCube.CubieD.TwistSym;
      }
    }
  }

  static InitUDSliceMoveConj(): void {
    for (let i = 0; i < CoordCube.N_SLICE; i++) {
      CoordCube.UDSliceMove[i] = [];
      CoordCube.UDSliceConj[i] = [];
      CoordCube.CubieC.UDSlice = i;
      for (let j = 0; j < CoordCube.N_MOVES; j++) {
        CubieCube.EdgeMult(CoordCube.CubieC, CubieCube.MoveCube[j], CoordCube.CubieD);
        CoordCube.UDSliceMove[i][j] = CoordCube.CubieD.UDSlice;
      }
      for (let j = 0; j < 16; j += 2) {
        CubieCube.EdgeConjugate(CoordCube.CubieC, CubieCube.SymMultInv[0][j], CoordCube.CubieD);
        CoordCube.UDSliceConj[i][j >> 1] = CoordCube.CubieD.UDSlice;
      }
    }
  }

  static SetPruning(table: number[], index: number, value: number): void {
    table[index >> 3] ^= value << (index << 2); // index << 2 <=> (index & 7) << 2
  }

  static GetPruning(table: number[], index: number): number {
    return (table[index >> 3] >> (index << 2)) & 0xf; // index << 2 <=> (index & 7) << 2
  }

  static HasZero(val: number): boolean {
    return ((val - 0x11111111) & ~val & 0x88888888) != 0;
  }

  static InitRawSymPrun(
    PrunTable: number[],
    N_RAW: number,
    N_SYM: number,
    RawMove: number[][],
    RawConj: number[][],
    SymMove: number[][],
    SymState: number[],
    PrunFlag: number
  ): void {
    const SYM_SHIFT = PrunFlag & 0xf;
    const SYM_E2C_MAGIC = ((PrunFlag >> 4) & 1) == 1 ? 0x00dddd00 : 0x00000000;
    const IS_PHASE2 = ((PrunFlag >> 5) & 1) == 1;
    const INV_DEPTH = (PrunFlag >> 8) & 0xf;
    const MAX_DEPTH = (PrunFlag >> 12) & 0xf;
    const MIN_DEPTH = (PrunFlag >> 16) & 0xf;

    const SYM_MASK = (1 << SYM_SHIFT) - 1;
    const N_SIZE = N_RAW * N_SYM;
    const N_MOVES = IS_PHASE2 ? 10 : 18;
    const NEXT_AXIS_MAGIC = N_MOVES == 10 ? 0x42 : 0x92492;

    let depth = CoordCube.GetPruning(PrunTable, N_SIZE) - 1;

    if (depth == -1) {
      for (let i = 0; i < (N_SIZE >> 3) + 1; i++) {
        PrunTable[i] = 0xffffffff;
      }
      CoordCube.SetPruning(PrunTable, 0, 0 ^ 0xf);
      depth = 0;
    } else {
      CoordCube.SetPruning(PrunTable, N_SIZE, 0xf ^ (depth + 1));
    }

    const SEARCH_DEPTH = Math.min(Math.max(depth + 1, MIN_DEPTH), MAX_DEPTH);

    while (depth < SEARCH_DEPTH) {
      const inv = depth > INV_DEPTH;
      const select = inv ? 0xf : depth;
      const selArrMask = select * 0x11111111;
      const check = inv ? depth : 0xf;
      depth++;
      CoordCube.inited++;
      const xorVal = depth ^ 0xf;
      let val = 0;
      for (let i = 0; i < N_SIZE; i++, val >>= 4) {
        if ((i & 7) == 0) {
          val = PrunTable[i >> 3];
          if (!CoordCube.HasZero(val ^ selArrMask)) {
            i += 7;
            continue;
          }
        }
        if ((val & 0xf) != select) {
          continue;
        }
        const raw = i % N_RAW;
        const sym = ~~(i / N_RAW);
        for (let m = 0; m < N_MOVES; m++) {
          let symx = SymMove[sym][m];
          const rawx = RawConj[RawMove[raw][m]][symx & SYM_MASK];
          symx >>= SYM_SHIFT;
          const idx = symx * N_RAW + rawx;
          const prun = CoordCube.GetPruning(PrunTable, idx);
          if (prun != check) {
            if (prun < depth - 1) {
              m += (NEXT_AXIS_MAGIC >> m) & 3;
            }
            continue;
          }
          if (inv) {
            CoordCube.SetPruning(PrunTable, i, xorVal);
            break;
          }
          CoordCube.SetPruning(PrunTable, idx, xorVal);
          for (let j = 1, symState = SymState[symx]; (symState >>= 1) != 0; j++) {
            if ((symState & 1) != 1) {
              continue;
            }
            let idxx = symx * N_RAW;
            idxx += RawConj[rawx][j ^ ((SYM_E2C_MAGIC >> (j << 1)) & 3)];
            if (CoordCube.GetPruning(PrunTable, idxx) == check) {
              CoordCube.SetPruning(PrunTable, idxx, xorVal);
            }
          }
        }
      }
    }
    CoordCube.SetPruning(PrunTable, N_SIZE, (depth + 1) ^ 0xf);
  }

  static InitSliceTwistPrun(): void {
    CoordCube.InitRawSymPrun(
      CoordCube.UDSliceTwistPrun,
      495,
      324,
      CoordCube.UDSliceMove,
      CoordCube.UDSliceConj,
      CoordCube.TwistMove,
      CubieCube.SymStateTwist,
      0x69603
    );
  }

  static InitSliceFlipPrun(): void {
    CoordCube.InitRawSymPrun(
      CoordCube.UDSliceFlipPrun,
      495,
      336,
      CoordCube.UDSliceMove,
      CoordCube.UDSliceConj,
      CoordCube.FlipMove,
      CubieCube.SymStateFlip,
      0x69603
    );
  }

  static InitMCPermPrun(): void {
    CoordCube.InitRawSymPrun(
      CoordCube.MCPermPrun,
      24,
      2768,
      CoordCube.MPermMove,
      CoordCube.MPermConj,
      CoordCube.CPermMove,
      CubieCube.SymStatePerm,
      0x8ea34
    );
  }

  static InitEPermCombPPrun(): void {
    CoordCube.InitRawSymPrun(
      CoordCube.EPermCCombPPrun,
      CoordCube.N_COMB,
      2768,
      CoordCube.CCombPMove,
      CoordCube.CCombPConj,
      CoordCube.EPermMove,
      CubieCube.SymStatePerm,
      0x7d824
    );
  }

  setWithPrun(cc: CubieCube, depth: number): boolean {
    this.twist = cc.TwistSym;
    this.flip = cc.FlipSym;
    this.tsym = this.twist & 7;
    this.twist = this.twist >> 3;
    this.prun = 0;
    this.fsym = this.flip & 7;
    this.flip = this.flip >> 3;
    this.slice = cc.UDSlice;
    this.prun = Math.max(
      this.prun,
      Math.max(
        CoordCube.GetPruning(
          CoordCube.UDSliceTwistPrun,
          this.twist * CoordCube.N_SLICE + CoordCube.UDSliceConj[this.slice][this.tsym]
        ),
        CoordCube.GetPruning(
          CoordCube.UDSliceFlipPrun,
          this.flip * CoordCube.N_SLICE + CoordCube.UDSliceConj[this.slice][this.fsym]
        )
      )
    );
    return this.prun <= depth;
  }

  doMovePrun(cc: CoordCube, m: number): number {
    this.slice = CoordCube.UDSliceMove[cc.slice][m];
    this.flip = CoordCube.FlipMove[cc.flip][CubieCube.Sym8Move[(m << 3) | cc.fsym]];
    this.fsym = (this.flip & 7) ^ cc.fsym;
    this.flip >>= 3;
    this.twist = CoordCube.TwistMove[cc.twist][CubieCube.Sym8Move[(m << 3) | cc.tsym]];
    this.tsym = (this.twist & 7) ^ cc.tsym;
    this.twist >>= 3;
    this.prun = Math.max(
      CoordCube.GetPruning(
        CoordCube.UDSliceTwistPrun,
        this.twist * CoordCube.N_SLICE + CoordCube.UDSliceConj[this.slice][this.tsym]
      ),
      CoordCube.GetPruning(
        CoordCube.UDSliceFlipPrun,
        this.flip * CoordCube.N_SLICE + CoordCube.UDSliceConj[this.slice][this.fsym]
      )
    );
    return this.prun;
  }
}
