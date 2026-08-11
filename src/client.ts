export type CodeGroupChangeDetail = {
  index: number;
  source: "keyboard" | "pointer";
  syncKey?: string;
  value: string;
};

type ManagedRoot = ParentNode & {
  __rehypeCodeGroupCleanup__?: () => void;
};

/** Enhance code groups within a document or document fragment. */
export const initCodeGroups = (root: ParentNode = document): (() => void) => {
  const managedRoot = root as ManagedRoot;
  if (managedRoot.__rehypeCodeGroupCleanup__) {
    return managedRoot.__rehypeCodeGroupCleanup__;
  }
  const synchronizedValues = new Map<string, string>();

  const storageKey = (group: Element) => {
    const syncKey = group.getAttribute("data-rcg-sync");
    return syncKey ? `rehype-code-group:${syncKey}` : undefined;
  };

  const readPersistedValue = (group: Element) => {
    const key = storageKey(group);
    if (!key) return undefined;
    if (group.getAttribute("data-rcg-persist") === "url") {
      return new URL(location.href).searchParams.get(
        `rcg-${group.getAttribute("data-rcg-sync")}`,
      );
    }
    if (group.getAttribute("data-rcg-persist") !== "local") return undefined;
    try {
      return localStorage.getItem(key) ?? undefined;
    } catch {
      return undefined;
    }
  };

  const persistValue = (group: Element, value: string) => {
    if (group.getAttribute("data-rcg-persist") === "url") {
      const syncKey = group.getAttribute("data-rcg-sync");
      if (!syncKey) return;
      const url = new URL(location.href);
      url.searchParams.set(`rcg-${syncKey}`, value);
      history.replaceState(history.state, "", url);
      return;
    }
    if (group.getAttribute("data-rcg-persist") !== "local") return;
    const key = storageKey(group);
    if (!key) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable in privacy modes or sandboxed documents.
    }
  };

  const selectIndex = (targetGroup: Element, targetIndex: number) => {
    const targetTabs = Array.from(
      targetGroup.querySelectorAll<HTMLElement>(".rcg-tab"),
    );
    const targetPanels = Array.from(
      targetGroup.querySelectorAll<HTMLElement>(".rcg-block"),
    );
    const activeTabClasses = (
      targetGroup.getAttribute("data-rcg-active-tab-classes") ?? "active"
    )
      .split(/\s+/)
      .filter(Boolean);
    const activeBlockClasses = (
      targetGroup.getAttribute("data-rcg-active-block-classes") ?? "active"
    )
      .split(/\s+/)
      .filter(Boolean);
    targetTabs.forEach((candidate, candidateIndex) => {
      const selected = candidateIndex === targetIndex;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      for (const className of activeTabClasses) {
        candidate.classList.toggle(className, selected);
      }
      for (const className of activeBlockClasses) {
        targetPanels[candidateIndex]?.classList.toggle(className, selected);
      }
      if (targetPanels[candidateIndex]) {
        targetPanels[candidateIndex].hidden = !selected;
      }
    });
  };

  const enhance = (group: Element) => {
    const tabs = Array.from(group.querySelectorAll<HTMLElement>(".rcg-tab"));
    const panels = Array.from(
      group.querySelectorAll<HTMLElement>(".rcg-block"),
    );
    if (tabs.length === 0 || tabs.length !== panels.length) return;

    let selectedIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"),
    );
    const syncKey = group.getAttribute("data-rcg-sync") ?? undefined;
    const storedValue = readPersistedValue(group);
    const preferredValue =
      storedValue ?? (syncKey ? synchronizedValues.get(syncKey) : undefined);
    if (preferredValue) {
      const storedIndex = tabs.findIndex(
        (tab) => tab.getAttribute("data-rcg-value") === preferredValue,
      );
      if (storedIndex >= 0) selectedIndex = storedIndex;
    }
    const selectedValue = tabs[selectedIndex]?.getAttribute("data-rcg-value");
    if (syncKey && selectedValue) {
      synchronizedValues.set(syncKey, selectedValue);
    }

    group.setAttribute("data-rcg-enhanced", "");
    selectIndex(group, selectedIndex);
    if (syncKey && storedValue) {
      root.querySelectorAll(".rehype-code-group").forEach((candidateGroup) => {
        if (
          candidateGroup === group ||
          !candidateGroup.hasAttribute("data-rcg-enhanced") ||
          candidateGroup.getAttribute("data-rcg-sync") !== syncKey
        ) {
          return;
        }
        const matchingIndex = Array.from(
          candidateGroup.querySelectorAll<HTMLElement>(".rcg-tab"),
        ).findIndex(
          (candidate) =>
            candidate.getAttribute("data-rcg-value") === storedValue,
        );
        if (matchingIndex >= 0) selectIndex(candidateGroup, matchingIndex);
      });
    }
  };

  const select = (
    tab: HTMLElement,
    source: CodeGroupChangeDetail["source"],
  ) => {
    const group = tab.closest(".rehype-code-group");
    if (!group || !root.contains(group)) return;

    const tabs = Array.from(group.querySelectorAll<HTMLElement>(".rcg-tab"));
    const panels = Array.from(
      group.querySelectorAll<HTMLElement>(".rcg-block"),
    );
    const index = tabs.indexOf(tab);
    if (index < 0 || !panels[index]) return;

    selectIndex(group, index);
    const syncKey = group.getAttribute("data-rcg-sync") ?? undefined;
    const value =
      tab.getAttribute("data-rcg-value") ??
      tab.textContent?.trim() ??
      String(index);
    if (syncKey) {
      synchronizedValues.set(syncKey, value);
      root.querySelectorAll(".rehype-code-group").forEach((candidateGroup) => {
        if (
          candidateGroup === group ||
          candidateGroup.getAttribute("data-rcg-sync") !== syncKey
        ) {
          return;
        }
        const candidateTabs = Array.from(
          candidateGroup.querySelectorAll<HTMLElement>(".rcg-tab"),
        );
        const matchingIndex = candidateTabs.findIndex(
          (candidate) => candidate.getAttribute("data-rcg-value") === value,
        );
        if (matchingIndex >= 0) {
          selectIndex(candidateGroup, matchingIndex);
          persistValue(candidateGroup, value);
        }
      });
    }
    persistValue(group, value);

    group.dispatchEvent(
      new CustomEvent<CodeGroupChangeDetail>("rehype-code-group:change", {
        bubbles: true,
        detail: {
          index,
          source,
          syncKey,
          value,
        },
      }),
    );
  };

  const onClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const tab = target.closest<HTMLElement>(".rcg-tab");
    if (tab) select(tab, "pointer");
  };

  const onKeydown = (event: Event) => {
    if (!(event instanceof KeyboardEvent)) return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(".rcg-tab")) {
      return;
    }

    const group = target.closest(".rehype-code-group");
    if (!group || !root.contains(group)) return;
    const tabs = Array.from(group.querySelectorAll<HTMLElement>(".rcg-tab"));
    const currentIndex = tabs.indexOf(target);
    if (currentIndex < 0) return;

    let nextIndex: number | undefined;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === undefined) {
      const tabList = target.closest('[role="tablist"]');
      const vertical = tabList?.getAttribute("aria-orientation") === "vertical";
      const direction = getComputedStyle(group).direction;
      const delta = vertical
        ? event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowUp"
            ? -1
            : 0
        : event.key === "ArrowRight"
          ? direction === "rtl"
            ? -1
            : 1
          : event.key === "ArrowLeft"
            ? direction === "rtl"
              ? 1
              : -1
            : 0;
      if (delta === 0) return;
      nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
    }

    event.preventDefault();
    const next = tabs[nextIndex];
    next.focus();
    select(next, "keyboard");
  };

  root.querySelectorAll(".rehype-code-group").forEach(enhance);
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeydown);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(".rehype-code-group")) enhance(node);
        node.querySelectorAll(".rehype-code-group").forEach(enhance);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });

  const cleanup = () => {
    observer.disconnect();
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKeydown);
    delete managedRoot.__rehypeCodeGroupCleanup__;
  };
  managedRoot.__rehypeCodeGroupCleanup__ = cleanup;
  return cleanup;
};

if (typeof document !== "undefined") {
  initCodeGroups(document);
}
