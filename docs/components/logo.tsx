import type { SVGProps } from "react";

/** The stacked-folders mark from `public/favicon.svg`. */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path
        d="M17 7h24l6 6h6a5 5 0 0 1 5 5v28a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5V12a5 5 0 0 1 5-5Z"
        fill="#fff7ed"
        stroke="#f1d5c0"
        strokeWidth="1"
      />
      <path
        d="M11 13h23l6 6h7a5 5 0 0 1 5 5v27a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z"
        fill="#be185d"
      />
      <path
        d="M7 20h20l6 6h18a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V25a5 5 0 0 1 5-5Z"
        fill="#fb923c"
      />
      <path
        d="m22 35-7 7 7 7m13-14 7 7-7 7"
        fill="none"
        stroke="#fff7ed"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}
