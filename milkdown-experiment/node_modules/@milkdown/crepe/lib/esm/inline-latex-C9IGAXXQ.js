import { $nodeSchema } from '@milkdown/kit/utils';
import katex from 'katex';

const mathInlineId = "math_inline";
const mathInlineSchema = $nodeSchema(mathInlineId, () => ({
  group: "inline",
  inline: true,
  draggable: true,
  atom: true,
  attrs: {
    value: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: `span[data-type="${mathInlineId}"]`,
      getAttrs: (dom) => {
        var _a;
        return {
          value: (_a = dom.dataset.value) != null ? _a : ""
        };
      }
    }
  ],
  toDOM: (node) => {
    const code = node.attrs.value;
    const dom = document.createElement("span");
    dom.dataset.type = mathInlineId;
    dom.dataset.value = code;
    katex.render(code, dom, {
      throwOnError: false
    });
    return dom;
  },
  parseMarkdown: {
    match: (node) => node.type === "inlineMath",
    runner: (state, node, type) => {
      state.addNode(type, { value: node.value });
    }
  },
  toMarkdown: {
    match: (node) => node.type.name === mathInlineId,
    runner: (state, node) => {
      state.addNode("inlineMath", void 0, node.attrs.value);
    }
  }
}));

export { mathInlineId as a, mathInlineSchema as m };
//# sourceMappingURL=inline-latex-C9IGAXXQ.js.map
