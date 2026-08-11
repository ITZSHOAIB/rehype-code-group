/**
 * Class names used for styling the code group elements.
 */
export type ClassNames = {
  /**
   * The class name for the active tab.
   * This class will be applied to the currently active tab to highlight it.
   * Default: "active"
   */
  activeTabClass: string;

  /**
   * The class name for the active code block.
   * This class will be applied to the currently active code block to make it visible.
   * Default: "active"
   */
  activeBlockClass: string;

  /**
   * The class name for the tab elements.
   * This class will be applied to each tab button.
   * Default: "rcg-tab"
   */
  tabClass: string;

  /**
   * The class name for the container of the tabs.
   * This class will be applied to the container element that holds all the tab buttons.
   * Default: "rcg-tab-container"
   */
  tabContainerClass: string;

  /**
   * The class name for the container of the code blocks.
   * This class will be applied to the container element that holds all the code blocks.
   * Default: "rcg-blocks"
   */
  blockContainerClass: string;

  /**
   * The class name for the entire code group.
   * This class will be applied to the main container element that wraps the tabs and code blocks.
   * Default: "rehype-code-group"
   */
  codeGroupClass: string;
};

/**
 * Options to customize the Rehype Code Group plugin.
 */
export type AssetOptions =
  | "inline"
  | "none"
  | { mode: "inline"; nonce?: string }
  | {
      mode: "external";
      nonce?: string;
      scriptSrc: string;
      stylesheetHref: string;
    };

export type LabelResolver = (label: string) => string;

export type RehypeCodeGroupOptions = {
  /** How the browser runtime and styles are delivered. Default: "inline". */
  assets?: AssetOptions;

  /** How malformed code groups are reported. Default: "warn". */
  diagnostics?: "warn" | "error" | "silent";

  /** Prefix for generated tab and panel IDs. Default: "rcg". */
  idPrefix?: string;

  /** Transform a tab's display label. Defaults to the small built-in emoji set. */
  labelResolver?: LabelResolver;

  /**
   * An object to override the default class names.
   * This allows you to provide custom class names for the various elements of the code group.
   * Example:
   * {
   *   activeTabClass: "my-active-tab",
   *   tabClass: "my-tab",
   *   tabContainerClass: "my-tab-container",
   *   blockContainerClass: "my-block-container",
   *   codeGroupClass: "my-code-group",
   * }
   */
  customClassNames?: Partial<ClassNames>;
};
