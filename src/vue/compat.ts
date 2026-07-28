import { defineComponent, h } from "vue";

function gridWidth(props: Record<string, boolean>): string | undefined {
  for (let i = 1; i <= 12; i++) {
    if (props[`xs${i}`]) {
      return `${(i / 12) * 100}%`;
    }
  }
  return undefined;
}

export const VLayoutCompat = defineComponent({
  name: "VLayout",
  props: {
    row: Boolean,
    wrap: Boolean,
    justifyCenter: Boolean,
    alignCenter: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: ["layout", attrs.class],
          style: [
            {
              display: "flex",
              flexDirection: props.row ? "row" : undefined,
              flexWrap: props.wrap ? "wrap" : undefined,
              justifyContent: props.justifyCenter ? "center" : undefined,
              alignItems: props.alignCenter ? "center" : undefined,
              width: "100%",
            },
            attrs.style as unknown,
          ],
        },
        slots.default?.(),
      );
  },
});

const flexProps: Record<string, unknown> = {
  dFlex: Boolean,
};
for (let i = 1; i <= 12; i++) {
  flexProps[`xs${i}`] = Boolean;
}

export const VFlexCompat = defineComponent({
  name: "VFlex",
  props: flexProps as never,
  setup(props: Record<string, boolean>, { attrs, slots }) {
    return () => {
      const width = gridWidth(props as Record<string, boolean>);
      return h(
        "div",
        {
          ...attrs,
          class: ["flex", attrs.class],
          style: [
            {
              display: props.dFlex ? "flex" : undefined,
              flex: width ? `0 0 ${width}` : "1 1 auto",
              maxWidth: width,
              minWidth: 0,
            },
            attrs.style as unknown,
          ],
        },
        slots.default?.(),
      );
    };
  },
});
