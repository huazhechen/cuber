import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clipboard,
  Code2,
  FastForward,
  HelpCircle,
  History,
  Home,
  Menu,
  Palette,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import * as THREE from "three";
import "./index.css";
import World from "./cuber/world";
import Cubelet from "./cuber/cubelet";
import { COLORS, FACE } from "./cuber/define";
import { PaletteData, PreferanceData } from "./data";
import { TwistAction, TwistNode } from "./cuber/twister";
import Toucher from "./vue/Viewport/toucher";
import Rubic from "./vue/Playground/rubic";
import Solver from "./solver/Solver";
import { configureRenderer } from "./cuber/three-compat";
import Util from "./common/util";
import GIF from "./common/gif";
import ZIP from "./common/zip";
import algsJson from "./vue/Algs/algs.json";

type Mode = "playground" | "helper" | "algs" | "director" | "player" | "help";
type StickerMap = { [face: string]: { [index: number]: string } | undefined };

type AppContext = {
  world: World;
  preferance: PreferanceData;
  palette: PaletteData;
};

const modeLabels: Record<Mode, string> = {
  playground: "练习",
  helper: "求解",
  algs: "公式",
  director: "动画",
  player: "播放",
  help: "帮助",
};

function readMode(): Mode {
  const mode = new URLSearchParams(location.search).get("mode") as Mode | null;
  return mode && modeLabels[mode] ? mode : "playground";
}

function openMode(mode: Mode): void {
  const url = mode === "playground" ? location.pathname : `${location.pathname}?mode=${mode}`;
  window.location.assign(url);
}

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const resize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);
  return size;
}

function useAppContext(): AppContext {
  return useMemo(() => {
    const world = new World();
    return {
      world,
      preferance: new PreferanceData(world),
      palette: new PaletteData(world),
    };
  }, []);
}

function useAnimation(callback: () => void): void {
  const cb = useRef(callback);
  cb.current = callback;
  useEffect(() => {
    let live = true;
    const loop = () => {
      if (!live) return;
      cb.current();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => {
      live = false;
    };
  }, []);
}

type ViewportHandle = {
  resize: (width: number, height: number) => void;
  draw: () => boolean;
};

const Viewport = forwardRef<ViewportHandle, { ctx: AppContext }>(({ ctx }, ref) => {
  const host = useRef<HTMLDivElement>(null);
  const renderer = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.style.outline = "none";
    const instance = configureRenderer(new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }));
    instance.autoClear = false;
    instance.setClearColor(COLORS.White, 0);
    instance.setPixelRatio(window.devicePixelRatio);
    return instance;
  }, []);
  const toucher = useMemo(() => new Toucher(), []);

  const draw = useCallback(() => {
    if (ctx.world.dirty || ctx.world.cube.dirty) {
      renderer.clear();
      renderer.render(ctx.world.scene, ctx.world.camera);
      ctx.world.dirty = false;
      ctx.world.cube.dirty = false;
      return true;
    }
    return false;
  }, [ctx.world, renderer]);

  useImperativeHandle(ref, () => ({
    resize(width, height) {
      ctx.world.width = width;
      ctx.world.height = Math.max(1, height);
      ctx.world.resize();
      renderer.setSize(width, Math.max(1, height), true);
      ctx.world.dirty = true;
    },
    draw,
  }));

  useEffect(() => {
    host.current?.appendChild(renderer.domElement);
    toucher.init(renderer.domElement, ctx.world.controller.touch);
    const wheel = (e: WheelEvent) => {
      if (e.target !== renderer.domElement) return;
      const next = Math.max(0, Math.min(100, ctx.preferance.scale + (e.deltaY > 0 ? -10 : 10)));
      ctx.preferance.scale = next;
      ctx.preferance.save();
    };
    document.addEventListener("wheel", wheel, false);
    return () => document.removeEventListener("wheel", wheel);
  }, [ctx, renderer, toucher]);

  return <div className="viewport" ref={host} />;
});

function IconButton({
  title,
  onClick,
  disabled = false,
  active = false,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button className={`icon-button ${active ? "active" : ""}`} title={title} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Modal({
  title,
  open,
  onClose,
  children,
  className = "",
  backdropClassName = "",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}) {
  if (!open) return null;
  return (
    <div className={`modal-backdrop ${backdropClassName}`} role="dialog" aria-modal="true">
      <div className={`modal ${className}`}>
        <header>
          <strong>{title}</strong>
          <IconButton title="关闭" onClick={onClose}>
            <X />
          </IconButton>
        </header>
        {children}
      </div>
    </div>
  );
}

function SettingsPanel({
  ctx,
  mode,
  onOrder,
  lockOrder = false,
}: {
  ctx: AppContext;
  mode: Mode;
  onOrder?: () => void;
  lockOrder?: boolean;
}) {
  const [, force] = useState(0);
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [scrubbingCamera, setScrubbingCamera] = useState(false);
  const [tab, setTab] = useState<"order" | "camera" | "control" | "appear" | "palette">("order");
  const update = () => {
    ctx.preferance.save();
    force((i) => i + 1);
  };
  const setPref = (key: keyof PreferanceData, value: number | boolean) => {
    (ctx.preferance as unknown as Record<string, number | boolean>)[key] = value;
    update();
  };
  const setColor = (key: string, value: string) => {
    ctx.palette.color(key, value);
    ctx.palette.save();
    force((i) => i + 1);
  };
  const resetConfig = () => {
    ctx.palette.reset();
    ctx.preferance.reset();
    force((i) => i + 1);
  };
  useEffect(() => {
    if (!scrubbingCamera) return;
    const finish = () => setScrubbingCamera(false);
    window.addEventListener("pointerup", finish);
    window.addEventListener("mouseup", finish);
    window.addEventListener("touchend", finish);
    window.addEventListener("touchcancel", finish);
    window.addEventListener("blur", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("mouseup", finish);
      window.removeEventListener("touchend", finish);
      window.removeEventListener("touchcancel", finish);
      window.removeEventListener("blur", finish);
    };
  }, [scrubbingCamera]);

  return (
    <>
      <button className="floating-menu" title="菜单" onClick={() => setOpen(true)}>
        <Menu />
      </button>
      <Modal
        title="Cuber 控制台"
        open={open}
        onClose={() => setOpen(false)}
        className={`settings-modal live-preview ${scrubbingCamera ? "scrubbing-preview" : ""}`}
        backdropClassName="preview-backdrop"
      >
        <div className="settings-chrome">
          <nav className="mode-nav">
            {(["playground", "helper", "algs", "director"] as Mode[]).map((item) => (
              <button key={item} className={mode === item ? "selected" : ""} onClick={() => openMode(item)}>
                {modeLabels[item]}
              </button>
            ))}
          </nav>
          <div className="settings-tabs-row">
            <div className="settings-tabs">
              {[
                ["order", "阶数", <Settings key="o" />],
                ["camera", "镜头", <Camera key="c" />],
                ["control", "控制", <SlidersHorizontal key="s" />],
                ["appear", "显示", <Sparkles key="a" />],
                ["palette", "配色", <Palette key="p" />],
                ["help", "帮助", <HelpCircle key="h" />],
              ].map(([key, label, icon]) => (
                <button
                  key={key as string}
                  className={tab === key ? "selected" : ""}
                  onClick={() => {
                    if (key === "help") {
                      setHelpOpen(true);
                    } else {
                      setTab(key as typeof tab);
                    }
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="settings-content">
          {tab === "order" && (
            <div className="button-grid">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((order) => (
                <button
                  key={order}
                  className={ctx.world.order === order ? "selected" : ""}
                  disabled={lockOrder}
                  onClick={() => {
                    ctx.world.order = order;
                    ctx.preferance.refresh();
                    onOrder?.();
                  }}
                >
                  {order} 阶
                </button>
              ))}
            </div>
          )}
          {tab === "camera" && (
            <div className="control-stack">
              <Range label="缩放" value={ctx.preferance.scale} onScrubStart={() => setScrubbingCamera(true)} onScrubEnd={() => setScrubbingCamera(false)} onChange={(v) => setPref("scale", v)} />
              <Range label="透视" value={ctx.preferance.perspective} onScrubStart={() => setScrubbingCamera(true)} onScrubEnd={() => setScrubbingCamera(false)} onChange={(v) => setPref("perspective", v)} />
              <Range label="水平角" value={ctx.preferance.angle} onScrubStart={() => setScrubbingCamera(true)} onScrubEnd={() => setScrubbingCamera(false)} onChange={(v) => setPref("angle", v)} />
              <Range label="俯仰角" value={ctx.preferance.gradient} onScrubStart={() => setScrubbingCamera(true)} onScrubEnd={() => setScrubbingCamera(false)} onChange={(v) => setPref("gradient", v)} />
              <Range label="自发光" value={ctx.preferance.stickerEmission} onScrubStart={() => setScrubbingCamera(true)} onScrubEnd={() => setScrubbingCamera(false)} onChange={(v) => setPref("stickerEmission", v)} />
            </div>
          )}
          {tab === "control" && (
            <div className="control-stack">
              <Range label="动画帧" value={ctx.preferance.frames} min={4} max={60} onChange={(v) => setPref("frames", v)} />
              <Range label="灵敏度" value={ctx.preferance.sensitivity} onChange={(v) => setPref("sensitivity", v)} />
            </div>
          )}
          {tab === "appear" && (
            <div className="toggle-grid">
              {[
                ["thickness", "厚贴纸"],
                ["mirror", "镜面"],
                ["hollow", "空心"],
                ["arrow", "箭头"],
                ["shadow", "光影"],
                ["dark", "深色界面"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={Boolean((ctx.preferance as unknown as Record<string, boolean>)[key]) ? "selected" : ""}
                  onClick={() => setPref(key as keyof PreferanceData, !Boolean((ctx.preferance as unknown as Record<string, boolean>)[key]))}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {tab === "palette" && (
            <div className="palette-grid">
              {["R", "L", "U", "D", "F", "B", "Core", "High", "Gray"].map((key) => (
                <label key={key} className="palette-card">
                  <input type="color" value={COLORS[key]} onChange={(e) => setColor(key, e.target.value)} />
                  <span>{key}</span>
                </label>
              ))}
              <button className="palette-card palette-reset" onClick={() => ctx.palette.reset()}>恢复默认</button>
            </div>
          )}
        </div>
      </Modal>
      <Modal title="Cuber 使用帮助" open={helpOpen} onClose={() => setHelpOpen(false)} className="help-modal">
        <div className="help-modal-body">
          <HelpContent compact />
          <div className="danger-zone">
            <button className="settings-reset danger" onClick={() => setResetOpen(true)}>
              <Trash2 />
              <span>重置数据</span>
            </button>
          </div>
        </div>
      </Modal>
      <Modal title="重置数据" open={resetOpen} onClose={() => setResetOpen(false)}>
        <p>选择要重置的范围。</p>
        <div className="modal-actions">
          <button onClick={() => setResetOpen(false)}>取消</button>
          <button onClick={() => { resetConfig(); setResetOpen(false); }}>配置</button>
          <button className="danger" onClick={() => { localStorage.clear(); location.reload(); }}>全部</button>
        </div>
      </Modal>
    </>
  );
}

function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  onScrubStart,
  onScrubEnd,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
}) {
  return (
    <label className="range-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onPointerDown={(e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Some range implementations do not expose pointer capture reliably.
          }
          onScrubStart?.();
        }}
        onMouseDown={onScrubStart}
        onTouchStart={onScrubStart}
        onPointerUp={onScrubEnd}
        onPointerCancel={onScrubEnd}
        onMouseUp={onScrubEnd}
        onTouchEnd={onScrubEnd}
        onTouchCancel={onScrubEnd}
        onBlur={onScrubEnd}
        onChange={(e) => {
          onScrubStart?.();
          onChange(Number(e.target.value));
        }}
      />
      <b>{value}</b>
    </label>
  );
}

type PlaybarHandle = {
  init: () => void;
  toggle: () => void;
  playing: boolean;
};

const Playbar = forwardRef<
  PlaybarHandle,
  { ctx: AppContext; scene: string; action: string; disabled?: boolean; onSettled?: () => void }
>(({ ctx, scene, action, disabled = false, onSettled }, ref) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const actions = useMemo(() => new TwistNode(action).parse(), [action]);
  const playingRef = useRef(false);
  const progressRef = useRef(0);
  const actionsRef = useRef(actions);
  const onSettledRef = useRef(onSettled);
  playingRef.current = playing;
  progressRef.current = progress;
  actionsRef.current = actions;
  onSettledRef.current = onSettled;

  const init = useCallback(() => {
    ctx.world.controller.lock = false;
    playingRef.current = false;
    progressRef.current = 0;
    setPlaying(false);
    setProgress(0);
    const setup = scene.replace("^", `(${action})'`);
    ctx.world.cube.twister.setup(setup);
  }, [action, ctx.world, scene]);

  const finish = () => {
    init();
    for (const item of actions) ctx.world.cube.twister.twist(item, true, true);
    playingRef.current = false;
    progressRef.current = actions.length;
    setProgress(actions.length);
  };

  const forward = () => {
    if (progressRef.current >= actions.length) return;
    if (progressRef.current === 0) init();
    playingRef.current = false;
    setPlaying(false);
    const item = actions[progressRef.current];
    progressRef.current += 1;
    setProgress(progressRef.current);
    ctx.world.cube.twister.twist(item, false, true);
  };

  const backward = () => {
    if (progressRef.current === 0) return;
    playingRef.current = false;
    setPlaying(false);
    const item = actions[progressRef.current - 1];
    progressRef.current -= 1;
    setProgress(progressRef.current);
    ctx.world.cube.twister.twist(new TwistAction(item.sign, !item.reverse, item.times), false, true);
  };

  useEffect(init, [init]);
  useEffect(() => {
    ctx.world.controller.disable = playing;
  }, [ctx.world, playing]);
  useEffect(() => {
    ctx.world.controller.lock = progress > 0;
  }, [ctx.world, progress]);

  const step = useCallback(() => {
    if (!playingRef.current) return;
    const list = actionsRef.current;
    if (progressRef.current === list.length) {
      playingRef.current = false;
      setPlaying(false);
      onSettledRef.current?.();
      return;
    }
    let next = progressRef.current;
    do {
      const item = list[next++];
      const success = ctx.world.cube.twister.twist(item, false, false);
      if (success) {
        progressRef.current = next;
        setProgress(next);
        if (next === list.length) break;
      } else {
        next--;
        break;
      }
    } while (next < list.length);
  }, [ctx.world]);

  useEffect(() => {
    const callback = () => step();
    ctx.world.callbacks.push(callback);
    return () => {
      ctx.world.callbacks = ctx.world.callbacks.filter((item) => item !== callback);
    };
  }, [ctx.world, step]);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    if (progressRef.current === 0) init();
    playingRef.current = true;
    setPlaying(true);
    step();
  }, [init, step]);

  useImperativeHandle(ref, () => ({
    init,
    toggle,
    get playing() {
      return playingRef.current;
    },
  }), [init, toggle]);

  const chaos = progress === 0 && ctx.world.cube.history.length !== 0;
  return (
    <div className="playbar">
      <input
        type="range"
        min={0}
        max={actions.length}
        value={progress}
        onChange={(e) => {
          init();
          const value = Number(e.target.value);
          for (let i = 0; i < value; i++) ctx.world.cube.twister.twist(actions[i], true, true);
          progressRef.current = value;
          setProgress(value);
        }}
      />
      <div className="toolbar">
        <IconButton title="回到开始" disabled={disabled || (progress === 0 && !chaos)} onClick={init}>
          <SkipBack />
        </IconButton>
        <IconButton title="上一步" disabled={disabled || progress === 0 || chaos} onClick={backward}>
          <ChevronLeft />
        </IconButton>
        <IconButton title={playing ? "暂停" : "播放"} disabled={disabled || progress === actions.length || chaos} onClick={toggle}>
          {playing ? <Pause /> : <Play />}
        </IconButton>
        <IconButton title="下一步" disabled={disabled || progress === actions.length || chaos} onClick={forward}>
          <ChevronRight />
        </IconButton>
        <IconButton title="跳到结尾" disabled={disabled || progress === actions.length || chaos} onClick={finish}>
          <SkipForward />
        </IconButton>
      </div>
    </div>
  );
});

class PlaygroundData {
  private values = { version: "0.5", order: 3, scrambler: "*", history: "", scene: "*", start: 0, now: 0, complete: false };
  constructor() {
    const save = localStorage.getItem("playground");
    if (save) {
      const data = JSON.parse(save);
      if (data.version === this.values.version) this.values = data;
    }
  }
  save() {
    localStorage.setItem("playground", JSON.stringify(this.values));
  }
  get order() { return this.values.order; } set order(v) { this.values.order = v; }
  get scrambler() { return this.values.scrambler; } set scrambler(v) { this.values.scrambler = v; }
  get history() { return this.values.history; } set history(v) { this.values.history = v; }
  get scene() { return this.values.scene; } set scene(v) { this.values.scene = v; }
  get start() { return this.values.start; } set start(v) { this.values.start = v; }
  get now() { return this.values.now; } set now(v) { this.values.now = v; }
  get complete() { return this.values.complete; } set complete(v) { this.values.complete = v; }
}

function formatScore(start: number, now: number, moves: number): string {
  let diff = now - start;
  const minute = Math.floor(diff / 60000);
  diff %= 60000;
  const second = Math.floor(diff / 1000);
  const ms = Math.floor((diff % 1000) / 100);
  return `${minute ? `${String(minute).padStart(2, "0")}:` : ""}${String(second).padStart(2, "0")}.${ms}/${moves}`;
}

function useKeyboard(callback: (exp: string) => void) {
  const [prefix, setPrefix] = useState("");
  useEffect(() => {
    let width = 2;
    const keymap: Record<number, string> = {
      73: "R", 75: "R'", 87: "B", 79: "B'", 83: "D", 76: "D'", 68: "L", 69: "L'",
      74: "U", 70: "U'", 72: "F", 71: "F'", 186: "y", 59: "y", 65: "y'", 85: "r",
      82: "l'", 77: "r'", 86: "l", 84: "x", 89: "x", 78: "x'", 66: "x'", 190: "M'",
      88: "M'", 53: "M", 54: "M", 80: "z", 81: "z'", 90: "d", 191: "d'", 67: "u'",
      188: "u", 37: "U", 38: "R", 39: "U'", 40: "R'",
    };
    const keydown = (event: KeyboardEvent) => {
      const id = event.keyCode || event.which;
      if (id === 51 || id === 55) {
        width = Math.max(2, width - 1);
        setPrefix(String(width));
      } else if (id === 52 || id === 56) {
        width += 1;
        setPrefix(String(width));
      }
      if (id === 8) callback("^");
      const key = keymap[id];
      if (key) {
        callback(width !== 2 && "lrfbdu".includes(key[0]) ? `${width}${key}` : key);
        setPrefix("");
      }
    };
    document.addEventListener("keydown", keydown, false);
    return () => document.removeEventListener("keydown", keydown);
  }, [callback]);
  return prefix;
}

function SceneShell({
  ctx,
  mode,
  viewportHeight,
  children,
  onOrder,
  lockOrder,
}: {
  ctx: AppContext;
  mode: Mode;
  viewportHeight: number;
  children: React.ReactNode;
  onOrder?: () => void;
  lockOrder?: boolean;
}) {
  const viewport = useRef<ViewportHandle>(null);
  const { width, height } = useWindowSize();
  useEffect(() => {
    viewport.current?.resize(width, Math.max(1, height - viewportHeight));
  }, [height, viewportHeight, width]);
  useAnimation(() => viewport.current?.draw());
  useEffect(() => {
    ctx.preferance.refresh();
    ctx.palette.refresh();
  }, [ctx]);
  return (
    <main className="app-shell">
      <SettingsPanel ctx={ctx} mode={mode} onOrder={onOrder} lockOrder={lockOrder} />
      <Viewport ref={viewport} ctx={ctx} />
      {children}
    </main>
  );
}

function Playground() {
  const ctx = useAppContext();
  const data = useMemo(() => new PlaygroundData(), []);
  const [, force] = useState(0);
  const [scrambleOpen, setScrambleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [link, setLink] = useState("");
  const [done, setDone] = useState(false);

  const sync = useCallback(() => {
    data.scene = ctx.world.cube.history.init;
    data.history = ctx.world.cube.history.exp.substring(1);
    if (!data.complete) {
      data.complete = ctx.world.cube.complete;
      if (data.complete) setDone(true);
    }
    data.save();
    force((i) => i + 1);
  }, [ctx.world, data]);

  const scramble = useCallback(() => {
    data.complete = true;
    if (data.scrambler === "*") ctx.world.cube.twister.twist(new TwistAction("*"), true, true);
    else ctx.world.cube.twister.setup(data.scrambler);
    data.complete = ctx.world.cube.complete;
    data.start = 0;
    data.now = 0;
    sync();
  }, [ctx.world, data, sync]);

  const load = useCallback(() => {
    if (data.scene === "*") {
      scramble();
      return;
    }
    ctx.world.order = data.order;
    ctx.world.cube.twister.setup(data.scene);
    for (const action of new TwistNode(data.history).parse()) ctx.world.cube.twister.twist(action, true, true);
    sync();
  }, [ctx.world, data, scramble, sync]);

  useEffect(load, [load]);
  useEffect(() => {
    ctx.world.callbacks.push(sync);
    return () => {
      ctx.world.callbacks = ctx.world.callbacks.filter((item) => item !== sync);
    };
  }, [ctx.world, sync]);

  useAnimation(() => {
    if (ctx.world.order < 10) {
      const tick = Math.sin((Date.now() / 2000) * Math.PI);
      ctx.world.cube.position.y = (tick * Cubelet.SIZE) / 64;
      ctx.world.cube.rotation.y = (tick / 768) * Math.PI;
      ctx.world.cube.dirty = true;
      ctx.world.cube.updateMatrix();
    }
    if (!data.complete) {
      if (ctx.world.cube.history.moves === 0) {
        data.start = 0;
        data.now = 0;
      } else {
        if (data.start === 0) data.start = Date.now();
        data.now = Date.now();
      }
      force((i) => i + 1);
    }
  });

  const prefix = useKeyboard((exp) => {
    if (exp === "^") ctx.world.cube.twister.undo();
    else ctx.world.cube.twister.twist(new TwistAction(exp), false, true);
  });

  const share = () => {
    const string = btoa(JSON.stringify({ order: ctx.world.order, drama: { scene: data.scene, action: data.history } }));
    const url = `${location.origin}${location.pathname}?mode=player&data=${string}`;
    setLink(url);
    setShareOpen(true);
  };

  return (
    <SceneShell
      ctx={ctx}
      mode="playground"
      viewportHeight={100}
      onOrder={() => {
        data.order = ctx.world.order;
        data.save();
        scramble();
      }}
    >
      <div className="score-pill">{formatScore(data.start, data.now, ctx.world.cube.history.moves)}</div>
      {prefix && <div className="key-pill">{prefix}</div>}
      <div className="bottom-panel">
        <div className="toolbar primary-toolbar">
          <IconButton title="重新打乱" onClick={() => setScrambleOpen(true)}><Shuffle /></IconButton>
          <IconButton title="历史" onClick={() => setHistoryOpen(true)}><History /></IconButton>
          <IconButton title="撤销" disabled={ctx.world.cube.history.length === 0} onClick={() => ctx.world.cube.twister.undo()}><RotateCcw /></IconButton>
          <IconButton title="分享" onClick={share}><Share2 /></IconButton>
        </div>
      </div>
      <Modal title="重新打乱" open={scrambleOpen} onClose={() => setScrambleOpen(false)}>
        <textarea value={data.scrambler} onChange={(e) => { data.scrambler = e.target.value; force((i) => i + 1); }} />
        <div className="modal-actions"><button onClick={() => setScrambleOpen(false)}>取消</button><button className="danger" onClick={() => { setScrambleOpen(false); scramble(); }}>确定</button></div>
      </Modal>
      <Modal title="历史记录" open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <label>打乱<textarea readOnly value={data.scene} /></label>
        <label>复原<textarea readOnly value={data.history} /></label>
        <div className="modal-actions">
          <button disabled={ctx.world.order > 3} onClick={() => { data.history = Rubic.adjust(data.history); data.save(); load(); }}>整理</button>
          <button disabled={ctx.world.order > 3} onClick={() => { const ret = Rubic.niss(data.scene, data.history); data.scene = ret.scene; data.history = ret.history; data.save(); load(); }}>NISS</button>
          <button onClick={share}>分享</button>
        </div>
      </Modal>
      <Modal title="分享链接" open={shareOpen} onClose={() => setShareOpen(false)}>
        <textarea readOnly value={link} />
        <div className="modal-actions"><button onClick={() => navigator.clipboard?.writeText(link)}>复制</button><button onClick={() => window.open(link)}>打开</button></div>
      </Modal>
      <Modal title="复原成功" open={done} onClose={() => setDone(false)}>
        <p>本次还原已经完成，可以查看历史或打开复盘播放。</p>
        <div className="modal-actions"><button onClick={() => setDone(false)}>知道了</button><button onClick={share}>复盘</button></div>
      </Modal>
    </SceneShell>
  );
}

function Helper() {
  const ctx = useAppContext();
  const solver = useMemo(() => new Solver(), []);
  const [color, setColor] = useState("R");
  const [stickers, setStickers] = useState<StickerMap>(() => JSON.parse(localStorage.getItem("helper-stickers") || "{}"));
  const [solution, setSolution] = useState("");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("");
  useEffect(() => {
    ctx.world.order = 3;
    ctx.world.controller.taps.push((index, face) => {
      if (face != null && index >= 0) {
        const cubelet = ctx.world.cube.cubelets[index];
        const initial = cubelet.initial;
        const realFace = cubelet.getFace(face);
        setStickers((value) => {
          const next = { ...value, [FACE[realFace]]: { ...(value[FACE[realFace]] || {}), [initial]: color } };
          localStorage.setItem("helper-stickers", JSON.stringify(next));
          ctx.world.cube.stick(initial, realFace, color);
          setState(ctx.world.cube.serialize());
          return next;
        });
      }
    });
  }, [color, ctx.world]);
  useAnimation(() => solver.init());
  const reset = () => {
    ctx.world.cube.reset();
    const next: StickerMap = {};
    for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
      const key = FACE[face];
      const group = ctx.world.cube.table.face(key);
      next[key] = {};
      for (const index of group.indices) next[key]![index] = key;
    }
    setStickers(next);
    localStorage.setItem("helper-stickers", JSON.stringify(next));
    setState(ctx.world.cube.serialize());
  };
  const clear = () => {
    setStickers({});
    localStorage.removeItem("helper-stickers");
    ctx.world.cube.strip({});
    setState(ctx.world.cube.serialize());
  };
  const solve = () => {
    const ret = solver.solve(ctx.world.cube.serialize());
    setSolution(ret || "error: solved");
    setOpen(true);
  };
  const counts = [...state].reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] || 0) + 1 }), {});
  return (
    <SceneShell ctx={ctx} mode="helper" viewportHeight={204} lockOrder>
      <div className="bottom-panel tall">
        <div className="color-grid">
          {["R", "F", "D", "L", "B", "U"].map((item) => (
            <button key={item} className={color === item ? "selected" : ""} style={{ background: COLORS[item] }} onClick={() => setColor(item)}>
              {color === item ? <Wand2 /> : counts[item] || 0}
            </button>
          ))}
          <button onClick={solve}><Sparkles />求解</button>
          <button onClick={reset}><RefreshCw />重置</button>
          <button className="danger" onClick={clear}><Trash2 />清空</button>
        </div>
      </div>
      <Modal title="解法" open={open} onClose={() => setOpen(false)}>
        <textarea readOnly value={solution} />
        <div className="modal-actions">
          <button disabled={solution.startsWith("error")} onClick={() => navigator.clipboard?.writeText(solution)}>复制</button>
          <button disabled={solution.startsWith("error")} onClick={() => window.open(`${location.pathname}?mode=player&data=${btoa(JSON.stringify({ order: 3, drama: { scene: ctx.world.cube.history.exp, action: solution, stickers } }))}`)}>播放</button>
        </div>
      </Modal>
    </SceneShell>
  );
}

function Player() {
  const ctx = useAppContext();
  const [scene, setScene] = useState("");
  const [action, setAction] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const raw = new URLSearchParams(location.search).get("data") || "";
      const data = JSON.parse(atob(raw));
      if (data.order) ctx.world.order = data.order;
      if (data.drama) {
        setScene(data.drama.scene || "");
        setAction(data.drama.action || "");
        const stickers = data.drama.stickers as StickerMap | undefined;
        if (stickers) {
          for (const face of [FACE.L, FACE.R, FACE.D, FACE.U, FACE.B, FACE.F]) {
            const list = stickers[FACE[face]];
            if (list) for (const sticker in list) ctx.world.cube.stick(Number(sticker), face, list[sticker]);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [ctx.world]);
  return (
    <SceneShell ctx={ctx} mode="player" viewportHeight={100} lockOrder>
      <div className="score-pill clickable" onClick={() => setOpen(true)}><Code2 />脚本</div>
      <div className="bottom-panel"><Playbar ctx={ctx} scene={scene} action={action} /></div>
      <Modal title="播放脚本" open={open} onClose={() => setOpen(false)}>
        <label>场景<textarea readOnly value={scene} /></label>
        <label>动作<textarea readOnly value={action} /></label>
      </Modal>
    </SceneShell>
  );
}

function Algs() {
  const ctx = useAppContext();
  const data = useMemo(() => algsJson as { name: string; strip: { [face: string]: number[] | undefined }; items: { name: string; origin: string; exp?: string; order?: number; scramble?: boolean }[] }[], []);
  const [group, setGroup] = useState(0);
  const [index, setIndex] = useState(0);
  const [list, setList] = useState(false);
  const [action, setAction] = useState("");
  const current = data[group].items[index];
  useEffect(() => {
    const order = current.order || 3;
    if (ctx.world.order !== order) ctx.world.order = order;
    ctx.world.cube.strip(data[group].strip);
    setAction(current.exp || current.origin);
  }, [ctx.world, current, data, group]);
  return (
    <SceneShell ctx={ctx} mode="algs" viewportHeight={158} lockOrder>
      <button className="score-pill clickable" onClick={() => setList(true)}><BookOpen />{current.name}</button>
      <div className="bottom-panel medium">
        <div className="script-row">
          <input value={action} onChange={(e) => setAction(e.target.value)} />
          <IconButton title="恢复默认" disabled={action === current.origin} onClick={() => setAction(current.origin)}><RotateCcw /></IconButton>
        </div>
        <Playbar ctx={ctx} scene={`x2${current.scramble ? "" : "^"}`} action={action} />
      </div>
      <Modal title="公式库" open={list} onClose={() => setList(false)} className="alg-modal">
        <div className="alg-layout">
          <div className="settings-tabs compact">
            {data.map((item, i) => <button key={item.name} className={group === i ? "selected" : ""} onClick={() => setGroup(i)}>{item.name}</button>)}
          </div>
          <div className="alg-grid">
            {data[group].items.map((item, i) => (
              <button key={item.name} onClick={() => { setIndex(i); setList(false); }}>
                <strong>{item.name}</strong>
                <span>{(item.exp || item.origin).slice(0, 70)}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </SceneShell>
  );
}

function Director() {
  const ctx = useAppContext();
  const playbar = useRef<PlaybarHandle>(null);
  const [scene, setScene] = useState("x2^");
  const [action, setAction] = useState("RUR'U'~");
  const [script, setScript] = useState(false);
  const [output, setOutput] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [recording, setRecording] = useState(false);
  const [pixel, setPixel] = useState(512);
  const [filmt, setFilmt] = useState<"gif" | "pngs">("gif");
  const [delay, setDelay] = useState(2);
  const filmer = useMemo(
    () => configureRenderer(new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })),
    []
  );
  const gif = useMemo(() => new GIF(COLORS), []);
  const zip = useMemo(() => new ZIP(), []);
  const pixels = useRef<Uint8Array>(new Uint8Array(0));
  const snap = () => {
    const width = ctx.world.width;
    const height = ctx.world.height;
    ctx.world.width = pixel;
    ctx.world.height = pixel;
    ctx.world.resize();
    filmer.setSize(pixel, pixel, true);
    filmer.setClearColor(0xffffff, 0);
    filmer.clear();
    filmer.render(ctx.world.scene, ctx.world.camera);
    ctx.world.width = width;
    ctx.world.height = height;
    ctx.world.resize();
    Util.DOWNLOAD("cuber", "png", filmer.domElement.toDataURL("image/png"));
  };
  const finish = () => {
    setRecording(false);
    if (filmt === "gif") {
      gif.finish();
      const blob = new Blob([gif.out.getData() as BlobPart], { type: "image/gif" });
      Util.DOWNLOAD("cuber", "gif", URL.createObjectURL(blob));
    } else {
      zip.finish();
      const blob = new Blob([zip.out.getData() as BlobPart], { type: "application/zip" });
      Util.DOWNLOAD("cuber", "zip", URL.createObjectURL(blob));
    }
  };
  useAnimation(() => {
    if (!recording) return;
    const width = ctx.world.width;
    const height = ctx.world.height;
    ctx.world.width = pixel;
    ctx.world.height = pixel;
    ctx.world.resize();
    filmer.clear();
    filmer.render(ctx.world.scene, ctx.world.camera);
    if (filmt === "gif") {
      const gl = filmer.getContext();
      gl.readPixels(0, 0, pixel, pixel, gl.RGBA, gl.UNSIGNED_BYTE, pixels.current);
      gif.add(pixels.current);
    } else {
      const raw = atob(filmer.domElement.toDataURL("image/png").split(";base64,")[1]);
      const data = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
      zip.add(`cuber${zip.num}.png`, data);
    }
    ctx.world.width = width;
    ctx.world.height = height;
    ctx.world.resize();
    if (playbar.current && !playbar.current.playing) finish();
  });
  const film = () => {
    if (recording) {
      finish();
      return;
    }
    filmer.setPixelRatio(1);
    filmer.setSize(pixel, pixel, true);
    if (filmt === "gif") {
      pixels.current = new Uint8Array(pixel * pixel * 4);
      gif.start(pixel, pixel, delay);
      filmer.setClearColor(0xffffff, 1);
    } else {
      zip.init();
      filmer.setClearColor(0xffffff, 0);
    }
    playbar.current?.init();
    playbar.current?.toggle();
    setRecording(true);
  };
  const share = () => {
    const data = btoa(JSON.stringify({ order: ctx.world.order, drama: { scene, action } }));
    const url = `${location.origin}${location.pathname}?mode=player&data=${data}`;
    setShareLink(url);
    setShareOpen(true);
    navigator.clipboard?.writeText(url).catch(() => undefined);
  };
  return (
    <SceneShell ctx={ctx} mode="director" viewportHeight={204}>
      <div className="bottom-panel tall">
        <div className="toolbar primary-toolbar">
          <IconButton title="输出设置" disabled={recording} onClick={() => setOutput(true)}><Settings /></IconButton>
          <IconButton title="截图" disabled={recording} onClick={snap}><Camera /></IconButton>
          <IconButton title={recording ? "停止录制" : "导出动画"} onClick={film}>{recording ? <Pause /> : <Clapperboard />}</IconButton>
          <IconButton title="分享" disabled={recording} onClick={share}><Share2 /></IconButton>
          <IconButton title="脚本" disabled={recording} onClick={() => setScript(true)}><Clipboard /></IconButton>
        </div>
        <div className="script-row"><input value={action} onChange={(e) => setAction(e.target.value)} /><IconButton title="展开" onClick={() => setAction(new TwistNode(action.startsWith("SSE:") ? Util.SSE2SIGN(ctx.world.order, action.replace("SSE:", "")) : action).parse().map((item) => item.value).join(" "))}><FastForward /></IconButton></div>
        <Playbar ref={playbar} ctx={ctx} scene={scene} action={action.startsWith("SSE:") ? Util.SSE2SIGN(ctx.world.order, action.replace("SSE:", "")) : action} disabled={recording} />
      </div>
      <Modal title="脚本编辑" open={script} onClose={() => setScript(false)}>
        <label>场景<textarea value={scene} onChange={(e) => setScene(e.target.value)} /></label>
        <label>动作<textarea value={action} onChange={(e) => setAction(e.target.value)} /></label>
      </Modal>
      <Modal title="分享链接" open={shareOpen} onClose={() => setShareOpen(false)}>
        <textarea readOnly value={shareLink} />
        <div className="modal-actions">
          <button onClick={() => navigator.clipboard?.writeText(shareLink)}>复制</button>
          <button onClick={() => window.open(shareLink)}>打开</button>
        </div>
      </Modal>
      <Modal title="输出设置" open={output} onClose={() => setOutput(false)}>
        <div className="option-group">
          <strong>画布尺寸</strong>
          <div className="button-grid">{[128, 256, 512, 1024, 2048].map((item) => <button key={item} className={pixel === item ? "selected" : ""} onClick={() => setPixel(item)}>{item}px</button>)}</div>
        </div>
        <div className="option-group">
          <strong>导出格式</strong>
          <div className="button-grid">{(["gif", "pngs"] as const).map((item) => <button key={item} className={filmt === item ? "selected" : ""} onClick={() => setFilmt(item)}>{item === "gif" ? "GIF 动画" : "PNG 序列"}</button>)}</div>
        </div>
        <div className="option-group">
          <strong>GIF 帧延迟</strong>
          <div className="button-grid">{[2, 3, 4, 5, 6, 10].map((item) => <button key={item} className={delay === item ? "selected" : ""} onClick={() => setDelay(item)}>{item} cs</button>)}</div>
        </div>
      </Modal>
    </SceneShell>
  );
}

function HelpContent({ compact = false }: { compact?: boolean }) {
  const keyRows = [
    ["1", "2", "3=<", "4=>", "5=M", "6=M", "7=<", "8=>", "9", "0"],
    ["Q=z'", "W=B", "E=L'", "R=Lw'", "T=x", "Y=x", "U=Rw", "I=R", "O=B'", "P=z"],
    ["A=y'", "S=D", "D=L", "F=U'", "G=F'", "H=F", "J=U", "K=R'", "L=D'", ";=y"],
    ["Z=Dw", "X=M'", "C=Uw'", "V=Lw", "B=x'", "N=x'", "M=Rw'", ",=Uw", ".=M'", "/=Dw'"],
    ["←=U", "↑=R", "→=U'", "↓=R'"],
  ];
  const quickStarts = [
    ["练习复原", "进入练习，点重新打乱；拖动贴纸转层，拖空白区域转视角；完成后可看历史或分享复盘。"],
    ["录入求解", "进入求解，先选颜色，再点魔方贴纸填色；颜色数量正确后点求解，可复制公式或直接播放。"],
    ["学习公式", "进入公式，选择 F2L / OLL / PLL 条目；用播放器逐步观察，必要时直接编辑公式文本。"],
    ["制作动画", "进入动画，编辑脚本，播放预览；需要素材时可截图、导出 GIF 或 PNG 序列。"],
  ];
  const modes = [
    ["练习", "自由操作魔方", "适合计时、打乱、复原、撤销、查看历史和分享复盘。"],
    ["求解", "三阶颜色录入", "适合把真实魔方状态录入到页面中，生成复原公式并播放检查。"],
    ["公式", "内置公式库", "适合按分类学习 F2L、OLL、PLL，逐步观察公式如何移动块。"],
    ["动画", "脚本与导出", "适合制作演示、教程素材、GIF 动画、透明 PNG 序列和分享播放链接。"],
    ["播放", "只读复盘", "由分享链接或求解结果打开，专注播放场景和动作，不改动原始脚本。"],
  ];
  return (
    <section className={compact ? "help compact-help" : "help-page"}>
      <h1>Cuber 使用帮助</h1>
      <p className="help-lead">
        Cuber 是一个在浏览器中运行的魔方工具箱。它既可以当作自由练习的虚拟魔方，也能用于三阶求解、公式学习、动画制作、复盘播放和外观配置。
      </p>

      <h2>快速开始</h2>
      <div className="help-grid">
        {quickStarts.map(([title, text]) => (
          <article key={title} className="help-card">
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <h2>模式怎么选</h2>
      <div className="help-mode-list">
        {modes.map(([name, title, text]) => (
          <article key={name} className="help-mode-item">
            <b>{name}</b>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>

      <h2>基础操作</h2>
      <ul>
        <li>在魔方贴纸上拖动可以转动对应层，在空白区域拖动可以旋转整体视角。</li>
        <li>滚轮可以缩放视图；控制台的“镜头”页可以精确调整缩放、透视、水平角和俯仰角。</li>
        <li>练习模式底部工具栏包含重新打乱、历史、撤销和分享。历史会保存初始场景和你的后续转动。</li>
        <li>历史记录会保存当前初始状态和后续转动，复盘会打开独立播放模式，便于逐步查看还原过程。</li>
        <li>重新打乱框中输入 <code>*</code> 会生成随机打乱；也可以输入指定公式作为打乱状态。</li>
      </ul>

      <h2>键盘操作</h2>
      <p>物理键盘会映射为常用转动，适合快速练习和公式输入。页面左上角会显示正在输入的数字前缀。</p>
      <div className="key-table">
        {keyRows.map((row, rowIndex) => (
          <div key={rowIndex} className="key-row">
            {row.map((item) => {
              const [key, action = ""] = item.split("=");
              return (
                <span key={item}>
                  <b>{key}</b>
                  <small>{action}</small>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <h2>求解模式</h2>
      <ul>
        <li>先在底部选择颜色，再点击魔方上的贴纸录入颜色。三阶魔方每种颜色应各出现 9 次。</li>
        <li>“重置”会恢复一个标准已还原状态；“清空”会移除所有贴纸颜色，适合重新录入。</li>
        <li>求解结果可以复制，也可以直接打开播放模式逐步检查。若返回错误，优先检查中心、棱块和角块颜色是否录入正确。</li>
      </ul>

      <h2>公式与播放</h2>
      <ul>
        <li>公式模式内置 F2L、OLL、PLL。点击左上角公式名称可打开列表并切换条目。</li>
        <li>播放条支持回到开始、上一步、播放/暂停、下一步、跳到结尾；进度滑块可以直接拖到任意步骤。</li>
        <li>公式输入框可以临时编辑。恢复按钮会把当前条目还原为内置公式。</li>
        <li>播放模式通常由分享链接、求解结果或动画分享打开，适合只读复盘和逐步讲解。</li>
      </ul>

      <h2>动画制作</h2>
      <ul>
        <li>“脚本”里有两个字段：场景用于布置初始状态，动作定义后续播放内容。</li>
        <li>“展开”会把组合公式解析成逐步动作，便于检查和导出。</li>
        <li>“截图”导出当前画面；“导出动画”可生成 GIF 或 PNG 序列；“分享”会复制可播放链接。</li>
        <li>输出设置可调整画布像素、导出格式和 GIF 帧延迟。PNG 序列适合继续放进剪辑或设计软件处理。</li>
      </ul>

      <h2>脚本语法</h2>
      <ul>
        <li>基础转动：<code>R U F D L B</code>；整体转动：<code>x y z</code>；宽层转动：<code>Rw Uw</code>。</li>
        <li>后缀 <code>'</code> 表示逆时针，数字表示重复次数，例如 <code>R'</code>、<code>U2</code>、<code>Rw2</code>。</li>
        <li>括号可以组合并重复，例如 <code>(R U R' U')2</code>。</li>
        <li>方括号支持交换子和共轭写法，例如 <code>[A,B]</code>、<code>[A:B]</code>。</li>
        <li><code>^</code> 会把前面的逆操作写入场景，常用于把动画起始状态先摆好；<code>~</code> 表示停顿，<code>;</code> 表示快速分隔，<code>#</code> 表示复位，<code>*</code> 表示随机打乱。</li>
        <li><code>SSE:</code> 前缀可输入 SSE 表达式，动画模式会在播放和展开时转换为标准动作。</li>
        <li><code>//</code> 可以添加行注释，注释内容不会被解析成动作。</li>
      </ul>

      <h2>控制台设置</h2>
      <ul>
        <li>第一排是模式切换，决定当前工作流；第二排是当前应用的设置页签。</li>
        <li>阶数支持 2 到 10 阶。求解和部分公式场景会锁定阶数，以保证算法和贴纸状态有效。</li>
        <li>镜头页调整缩放、透视和视角；控制页调整动画帧数和触控灵敏度。</li>
        <li>显示页切换厚贴纸、镜面、空心、箭头、光影和深色界面；配色页可修改六面颜色及辅助颜色。</li>
        <li>右侧重置按钮会打开重置确认。可以只重置配置，也可以清空本地数据并刷新页面。</li>
      </ul>

      <h2>数据与分享</h2>
      <ul>
        <li>练习数据、偏好设置和配色保存在浏览器本地存储中，不需要账号。</li>
        <li>分享链接会把阶数、场景、动作和必要贴纸状态编码到 URL 中。接收者打开后可直接复盘。</li>
        <li>如果页面表现异常，可以先尝试控制台重置配置；需要彻底恢复时再选择清空全部本地数据。</li>
      </ul>
    </section>
  );
}

function HelpPage() {
  return (
    <main className="document-shell">
      <button className="floating-menu" title="返回练习" onClick={() => openMode("playground")}><Home /></button>
      <HelpContent />
    </main>
  );
}

function App() {
  const mode = readMode();
  if (mode === "helper") return <Helper />;
  if (mode === "algs") return <Algs />;
  if (mode === "director") return <Director />;
  if (mode === "player") return <Player />;
  if (mode === "help") return <HelpPage />;
  return <Playground />;
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
