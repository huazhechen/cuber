import { defineComponent, h } from "vue";
import { VBtn } from "vuetify/components";

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

export const VBtnCompat = defineComponent({
  name: "VBtn",
  inheritAttrs: false,
  props: {
    text: Boolean,
    depressed: Boolean,
    fab: Boolean,
    fixed: Boolean,
    top: Boolean,
    bottom: Boolean,
    left: Boolean,
    right: Boolean,
    large: Boolean,
    block: Boolean,
    rounded: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const position = props.fixed
        ? {
            position: "fixed",
            top: props.top ? "0px" : undefined,
            bottom: props.bottom ? "0px" : undefined,
            left: props.left ? "0px" : undefined,
            right: props.right ? "0px" : undefined,
            zIndex: 1006,
          }
        : undefined;

      return h(
        VBtn as never,
        {
          ...attrs,
          class: ["cuber-btn", attrs.class],
          icon: props.fab || (attrs.icon as boolean | undefined),
          block: props.block || (attrs.block as boolean | undefined),
          size: props.large ? "large" : attrs.size,
          rounded: props.rounded || (attrs.rounded as boolean | undefined),
          variant: props.text ? "text" : props.depressed ? "flat" : attrs.variant,
          elevation: props.depressed ? 0 : attrs.elevation,
          style: [props.block ? { width: "100%" } : undefined, position, attrs.style as unknown],
        },
        slots,
      );
    };
  },
});
