import type { DetailedHTMLProps, HTMLAttributes } from "react";

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "inpost-geowidget": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        token?: string;
        language?: string;
        config?: string;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}