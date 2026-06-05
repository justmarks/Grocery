/* @ds-bundle: {"format":3,"namespace":"GroceryDesignSystem_df55be","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Brand","sourcePath":"components/core/Brand.jsx"},{"name":"Monogram","sourcePath":"components/core/Brand.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"AisleHeader","sourcePath":"components/grocery/AisleHeader.jsx"},{"name":"CategoryTag","sourcePath":"components/grocery/CategoryTag.jsx"},{"name":"GroceryItemRow","sourcePath":"components/grocery/GroceryItemRow.jsx"},{"name":"ModeToggle","sourcePath":"components/grocery/ModeToggle.jsx"},{"name":"StoreFilter","sourcePath":"components/grocery/StoreFilter.jsx"},{"name":"CATEGORIES","sourcePath":"components/grocery/categories.js"},{"name":"CATEGORY_BY_SLUG","sourcePath":"components/grocery/categories.js"}],"sourceHashes":{"components/core/Avatar.jsx":"bc243d5fcfac","components/core/Brand.jsx":"7dde28243d42","components/core/Button.jsx":"e88ea64ba367","components/core/Icon.jsx":"85504405fcc7","components/core/IconButton.jsx":"b5238a6dcc88","components/feedback/EmptyState.jsx":"11c5eaa7096c","components/feedback/Toast.jsx":"226ac5a5fbf4","components/forms/Checkbox.jsx":"07fa553dcab4","components/forms/Field.jsx":"639aba91033c","components/forms/Input.jsx":"d943cdca71aa","components/forms/Select.jsx":"4678f98a0b40","components/grocery/AisleHeader.jsx":"0522e682beb3","components/grocery/CategoryTag.jsx":"dc39221218af","components/grocery/GroceryItemRow.jsx":"86d4601d748e","components/grocery/ModeToggle.jsx":"766e74396097","components/grocery/StoreFilter.jsx":"95c877308911","components/grocery/categories.js":"d5b936313a64","ui_kits/grocery_app/GroceryApp.jsx":"6c1e29335fb2","ui_kits/grocery_app/PlanView.jsx":"8fc13f2ade37","ui_kits/grocery_app/ShopView.jsx":"7cfdd8659682","ui_kits/grocery_app/SignIn.jsx":"10fec7908cdc","ui_kits/grocery_app/data.js":"e1b06642a9a5"},"inlinedExternals":[],"unexposedExports":[{"name":"categoryColors","sourcePath":"components/grocery/categories.js"},{"name":"categoryLabel","sourcePath":"components/grocery/categories.js"}]} */

(() => {

const __ds_ns = (window.GroceryDesignSystem_df55be = window.GroceryDesignSystem_df55be || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Deterministic warm-palette pick from a name, so each household
// member keeps a stable color across sessions.
const AVATAR_BGS = ["var(--tomato-500)", "var(--olive-500)", "var(--saffron-500)", "var(--plum-500)", "var(--sky-700)", "var(--cocoa-700)"];
function hashName(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) | 0;
  return Math.abs(h);
}
function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Round household-member avatar. Renders a photo when `src` is given,
 * otherwise initials on a deterministic warm-palette disc.
 */
function Avatar({
  name,
  src,
  size = 32,
  className = "",
  style,
  ...rest
}) {
  const bg = AVATAR_BGS[hashName(name) % AVATAR_BGS.length];
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ["gr-avatar", className].join(" "),
    style: {
      width: size,
      height: size,
      fontSize: Math.round(size * 0.42),
      background: src ? "var(--paper-300)" : bg,
      ...style
    },
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Brand.jsx
try { (() => {
/**
 * Grocery brand mark — the sibling to the Marks Family Recipe Book
 * lockup. The wordmark reads "Marks Family" (Newsreader semibold) over
 * "Grocery" (Newsreader italic, tomato) — exactly paralleling the Recipe
 * Book's "Recipe Book" line. The monogram is a tomato list card with a
 * checked-off top row, drawn from design tokens so it tracks the palette.
 */
function Brand({
  variant = "lockup",
  size,
  className = ""
}) {
  if (variant === "mark") {
    return /*#__PURE__*/React.createElement(Monogram, {
      size: size ?? 32,
      className: className
    });
  }
  if (variant === "stacked") {
    const monogramSize = size ?? 72;
    return /*#__PURE__*/React.createElement("div", {
      className: className,
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement(Monogram, {
      size: monogramSize
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        fontWeight: 600,
        lineHeight: 1.05,
        letterSpacing: "var(--tracking-tight)",
        color: "var(--ink-900)",
        marginTop: "var(--space-4)",
        whiteSpace: "nowrap"
      }
    }, "Marks Family"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: "var(--text-xl)",
        lineHeight: 1.05,
        color: "var(--tomato-500)",
        marginTop: 2,
        whiteSpace: "nowrap"
      }
    }, "Grocery"));
  }

  // Default: horizontal lockup for the top bar / sidebar.
  const monogramSize = size ?? 34;
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Monogram, {
    size: monogramSize
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.15,
      minWidth: 0,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-base)",
      fontWeight: 600,
      color: "var(--ink-900)",
      whiteSpace: "nowrap"
    }
  }, "Marks Family"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "var(--text-sm)",
      color: "var(--tomato-500)",
      whiteSpace: "nowrap"
    }
  }, "Grocery")));
}

/** The tomato grocery-list monogram. Used in the top bar, sign-in, favicon. */
function Monogram({
  size = 34,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 120 120",
    fill: "none",
    className: className,
    style: {
      flex: "none"
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "6",
    width: "108",
    height: "108",
    rx: "26",
    fill: "var(--tomato-500)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "28",
    y: "24",
    width: "64",
    height: "72",
    rx: "10",
    fill: "var(--paper-100)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "38",
    y: "36",
    width: "13",
    height: "13",
    rx: "3",
    fill: "var(--olive-500)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M41 42.5 l2.6 2.6 l4.4 -5",
    stroke: "var(--paper-100)",
    strokeWidth: "2.4",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "57",
    y1: "42.5",
    x2: "82",
    y2: "42.5",
    stroke: "var(--ink-300)",
    strokeWidth: "3.4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "38",
    y: "58",
    width: "13",
    height: "13",
    rx: "3",
    fill: "none",
    stroke: "var(--paper-300)",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "57",
    y1: "64.5",
    x2: "84",
    y2: "64.5",
    stroke: "var(--ink-700)",
    strokeWidth: "3.4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "38",
    y: "80",
    width: "13",
    height: "13",
    rx: "3",
    fill: "none",
    stroke: "var(--paper-300)",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "57",
    y1: "86.5",
    x2: "79",
    y2: "86.5",
    stroke: "var(--ink-700)",
    strokeWidth: "3.4",
    strokeLinecap: "round"
  }));
}
Object.assign(__ds_scope, { Brand, Monogram });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Brand.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Lucide-style stroke icons, inlined as React fragments to keep the
 * primitives bundle self-contained (no Lucide runtime). 1.5px stroke,
 * 24x24 viewBox, `currentColor`. Sizes default to 20px.
 *
 * Shared with the Marks Family Recipe Book, extended with the grocery
 * glyphs this app needs (cart, store, snowflake, minus, filter). Keep
 * the set outline-only — never filled — to match the editorial vibe.
 */

const ICON_PATHS = {
  plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })),
  minus: /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }),
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16.5",
    y1: "16.5",
    x2: "21",
    y2: "21"
  })),
  check: /*#__PURE__*/React.createElement("polyline", {
    points: "4 12 10 18 20 6"
  }),
  x: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  })),
  "chevron-right": /*#__PURE__*/React.createElement("polyline", {
    points: "9 6 15 12 9 18"
  }),
  "chevron-left": /*#__PURE__*/React.createElement("polyline", {
    points: "15 6 9 12 15 18"
  }),
  "chevron-down": /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }),
  "chevron-up": /*#__PURE__*/React.createElement("polyline", {
    points: "6 15 12 9 18 15"
  }),
  "arrow-left": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "19",
    y1: "12",
    x2: "5",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 19 5 12 12 5"
  })),
  pencil: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 3 L21 8 L8 21 L3 21 L3 16 Z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    y1: "5",
    x2: "19",
    y2: "10"
  })),
  trash: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
    points: "3 6 21 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 6 v14 a2 2 0 0 0 2 2 h10 a2 2 0 0 0 2-2 v-14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 6 V4 a1 1 0 0 1 1-1 h4 a1 1 0 0 1 1 1 v2"
  })),
  // Grocery cart — the shopping-mode affordance and tab icon.
  "shopping-cart": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "20",
    r: "1.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "20",
    r: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 3 h2.5 l2.4 12.2 a1.5 1.5 0 0 0 1.5 1.2 h8.6 a1.5 1.5 0 0 0 1.5-1.2 l1.5-7.4 H6"
  })),
  // Storefront — the store filter / store-management icon.
  store: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 9 L5 4 h14 l1 5 a3 3 0 0 1-6 0 a3 3 0 0 1-6 0 a3 3 0 0 1-6 0 z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9 v11 h14 V9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 20 v-5 h4 v5"
  })),
  // Snowflake — the Grocery-only freezer aisle.
  snowflake: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "3",
    x2: "12",
    y2: "21"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5.6",
    y1: "5.6",
    x2: "18.4",
    y2: "18.4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18.4",
    y1: "5.6",
    x2: "5.6",
    y2: "18.4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "9 5 12 8 15 5"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "9 19 12 16 15 19"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "5 9 8 12 5 15"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "19 9 16 12 19 15"
  })),
  // Sliders — the store-filter affordance.
  filter: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "6",
    x2: "20",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "12",
    x2: "17",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "18",
    x2: "14",
    y2: "18"
  })),
  "list-checks": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m3 17 2 2 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3 7 2 2 4-4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "13",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "13",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "13",
    y1: "18",
    x2: "21",
    y2: "18"
  })),
  pencil_alt: /*#__PURE__*/React.createElement("path", {
    d: "M12 20h9"
  }),
  users: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "8",
    r: "3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 21 v-1 a5 5 0 0 1 5-5 h4 a5 5 0 0 1 5 5 v1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "9",
    r: "2.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 14 h2 a4 4 0 0 1 4 4 v1"
  })),
  user: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 21 v-1 a6 6 0 0 1 6-6 h4 a6 6 0 0 1 6 6 v1"
  })),
  settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
  })),
  sparkles: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3 L13.5 9 L19.5 10.5 L13.5 12 L12 18 L10.5 12 L4.5 10.5 L10.5 9 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 3 L19.5 5 L21.5 5.5 L19.5 6 L19 8 L18.5 6 L16.5 5.5 L18.5 5 Z"
  })),
  "share-2": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "5",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "19",
    r: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8.59",
    y1: "13.51",
    x2: "15.42",
    y2: "17.49"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15.41",
    y1: "6.51",
    x2: "8.59",
    y2: "10.49"
  })),
  mail: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "3 7 12 13 21 7"
  })),
  "log-out": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 4 h4 a2 2 0 0 1 2 2 v12 a2 2 0 0 1-2 2 h-4"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "9 16 4 12 9 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "16",
    y2: "12"
  })),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 7 12 12 16 14"
  })),
  "grip-vertical": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "1.25",
    stroke: "none",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "7",
    r: "1.25",
    stroke: "none",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "12",
    r: "1.25",
    stroke: "none",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "12",
    r: "1.25",
    stroke: "none",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "17",
    r: "1.25",
    stroke: "none",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "17",
    r: "1.25",
    stroke: "none",
    fill: "currentColor"
  }))
};
function Icon({
  name,
  size = 20,
  className,
  filled = false,
  ...rest
}) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    "aria-hidden": "true"
  }, rest), path);
}
const ICON_NAMES = Object.keys(ICON_PATHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICON_SIZE = {
  sm: 14,
  md: 16,
  lg: 18
};

/**
 * Primary action button. Tomato primary, warm focus ring, 44px min
 * tap target. Opt into a leading/trailing icon by name rather than
 * passing raw children, so icon sizing stays consistent.
 */
function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  iconFilled = false,
  className = "",
  type = "button",
  children,
  ...rest
}) {
  const classes = ["gr-btn", `gr-btn--${size}`, `gr-btn--${variant}`, className].join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: classes
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: ICON_SIZE[size],
    filled: iconFilled
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: ICON_SIZE[size]
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A square, borderless icon-only button — row actions (edit, delete),
 * top-bar controls. 44px min tap target with a paper hover wash.
 */
function IconButton({
  icon,
  size = 20,
  variant = "default",
  className = "",
  type = "button",
  filled = false,
  ...rest
}) {
  const classes = ["gr-iconbtn", variant === "danger" ? "gr-iconbtn--danger" : "", className].join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: classes
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size,
    filled: filled
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Centered empty state — an outlined icon in a paper disc, a serif
 * headline, a line of body copy, and an optional action slot. Used
 * for the fresh list, a fully-checked store, an empty import, etc.
 */
function EmptyState({
  icon = "shopping-cart",
  title,
  children,
  action,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["gr-empty", className].join(" "),
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "var(--space-12) var(--space-6)",
      gap: "var(--space-3)"
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      borderRadius: "var(--radius-pill)",
      background: "var(--paper-200)",
      color: "var(--ink-500)",
      marginBottom: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 28
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)"
    }
  }, title), children && /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: 320,
      margin: 0,
      color: "var(--ink-500)"
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-3)"
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/**
 * Bottom-center confirmation toast. Slides up + fades in over 200ms.
 * The one piece of "playful" motion in the system. Stateless — the
 * caller controls `visible`; pair with a setTimeout for auto-dismiss
 * (typically 2.5–3s). Always carries an olive check (the saved/added
 * affordance).
 */
function Toast({
  children,
  visible
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    "aria-live": "polite",
    className: "gr-toast",
    style: {
      position: "fixed",
      bottom: 96,
      left: "50%",
      zIndex: 50,
      pointerEvents: "none",
      transform: visible ? "translate(-50%, 0)" : "translate(-50%, 20px)",
      opacity: visible ? 1 : 0,
      transition: "transform 200ms cubic-bezier(0.22,1,0.36,1), opacity 200ms cubic-bezier(0.22,1,0.36,1)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gr-toast__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 16
  })), children);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The big shopping-mode checkoff. A 28px rounded square that fills
 * olive with a white check when checked. Built as a real button with
 * role="checkbox" so it's keyboard- and screen-reader-friendly and
 * comfortably tappable (the row around it extends the hit area).
 */
function Checkbox({
  checked = false,
  onChange,
  className = "",
  size = 28,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "checkbox",
    "aria-checked": checked,
    onClick: () => onChange && onChange(!checked),
    className: ["gr-check", className].join(" "),
    style: {
      width: size,
      height: size
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: Math.round(size * 0.62)
  }));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
/**
 * Form-field wrapper: bold label above the control, optional hint or
 * error line below. Wraps children in a <label> so native
 * label-for-control association works without htmlFor.
 */
function Field({
  label,
  hint,
  error,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "gr-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gr-field__label"
  }, label), children, error ? /*#__PURE__*/React.createElement("span", {
    className: "gr-field__error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "gr-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Standard text input. White card on cream paper, paper-400 border,
 * warm tomato focus halo. Use inside <Field> for the labelled pattern.
 */
function Input({
  className = "",
  type = "text",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    className: ["gr-input", className].join(" ")
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Standard select. Matches Input's border / radius / type so paired
 * fields align, with the native arrow hidden in favor of a chevron.
 */
function Select({
  className = "",
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gr-select-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    className: ["gr-select", className].join(" ")
  }, rest), children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: "gr-select-chevron"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/grocery/ModeToggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The Plan / Shop segmented toggle that sits at the top of the list.
 * "Plan" is write mode (add + edit items); "Shop" is read mode (big
 * checkoffs, store filter). The active Shop option tints olive to
 * signal the "at the store" context.
 */
function ModeToggle({
  value = "plan",
  onChange,
  className = "",
  ...rest
}) {
  const opts = [{
    key: "plan",
    label: "Plan",
    icon: "pencil"
  }, {
    key: "shop",
    label: "Shop",
    icon: "shopping-cart"
  }];
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["gr-modetoggle", className].join(" "),
    role: "tablist"
  }, rest), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.key,
    type: "button",
    role: "tab",
    "aria-selected": value === o.key,
    className: ["gr-modetoggle__opt", o.key === "shop" ? "gr-modetoggle__opt--shop" : ""].join(" "),
    onClick: () => onChange && onChange(o.key)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: o.icon,
    size: 16
  }), o.label)));
}
Object.assign(__ds_scope, { ModeToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/grocery/ModeToggle.jsx", error: String((e && e.message) || e) }); }

// components/grocery/StoreFilter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Sticky single-store filter for shopping mode. A horizontal row of
 * pills — "All stores" plus one per household store — where exactly
 * one is active. Selection is meant to persist in local storage so
 * reopening the app at the store keeps the filter (the parent owns
 * `value`; this is presentational).
 */
function StoreFilter({
  stores = [],
  value = "all",
  onChange,
  className = "",
  ...rest
}) {
  const options = [{
    key: "all",
    label: "All stores",
    icon: "filter"
  }].concat(stores.map(s => ({
    key: s,
    label: s,
    icon: "store"
  })));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["gr-storefilter", className].join(" "),
    style: {
      display: "flex",
      gap: "var(--space-2)",
      overflowX: "auto"
    }
  }, rest), options.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.key,
    type: "button",
    className: "gr-chip",
    "aria-pressed": value === opt.key,
    onClick: () => onChange && onChange(opt.key)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: opt.icon,
    size: 15
  }), opt.label)));
}
Object.assign(__ds_scope, { StoreFilter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/grocery/StoreFilter.jsx", error: String((e && e.message) || e) }); }

// components/grocery/categories.js
try { (() => {
/**
 * Grocery aisle categories — the eleven GROCERY_CATEGORIES (ten
 * inherited from RecipeTracker's meal-plan schema, plus the
 * Grocery-only `freezer`). Each maps to a human label, a CSS-var
 * token prefix (resolving to --cat-<key>-bg / -mid / -fg), and an
 * icon. Kept in canonical store-walk order: perishables first,
 * pantry + paper last.
 *
 * Imported by category-aware components (CategoryTag, AisleHeader)
 * and any UI kit screen that renders the list.
 */
const CATEGORIES = [{
  slug: "fruits",
  label: "Fruits",
  token: "fruits",
  icon: "sparkles"
}, {
  slug: "vegetables",
  label: "Vegetables",
  token: "vegetables",
  icon: "sparkles"
}, {
  slug: "meats",
  label: "Meats",
  token: "meats",
  icon: "sparkles"
}, {
  slug: "dairy",
  label: "Dairy",
  token: "dairy",
  icon: "sparkles"
}, {
  slug: "cheeses",
  label: "Cheeses",
  token: "cheeses",
  icon: "sparkles"
}, {
  slug: "baking-and-dry-goods",
  label: "Baking & Dry Goods",
  token: "baking",
  icon: "sparkles"
}, {
  slug: "bread-and-crackers",
  label: "Bread & Crackers",
  token: "bread",
  icon: "sparkles"
}, {
  slug: "beverages",
  label: "Beverages",
  token: "beverages",
  icon: "sparkles"
}, {
  slug: "paper-goods",
  label: "Paper Goods",
  token: "paper",
  icon: "sparkles"
}, {
  slug: "freezer",
  label: "Freezer",
  token: "freezer",
  icon: "snowflake"
}, {
  slug: "misc",
  label: "Misc",
  token: "misc",
  icon: "sparkles"
}];
const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]));

/** Resolve a category's three color tokens to CSS var() expressions. */
function categoryColors(slug) {
  const c = CATEGORY_BY_SLUG[slug] ?? CATEGORY_BY_SLUG.misc;
  return {
    bg: `var(--cat-${c.token}-bg)`,
    mid: `var(--cat-${c.token}-mid)`,
    fg: `var(--cat-${c.token}-fg)`
  };
}
function categoryLabel(slug) {
  return (CATEGORY_BY_SLUG[slug] ?? CATEGORY_BY_SLUG.misc).label;
}
Object.assign(__ds_scope, { CATEGORIES, CATEGORY_BY_SLUG, categoryColors, categoryLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/grocery/categories.js", error: String((e && e.message) || e) }); }

// components/grocery/AisleHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The serif header above each aisle section. Shows a category color
 * dot, the aisle name, and an optional item count on the right.
 */
function AisleHeader({
  category,
  count,
  className = "",
  ...rest
}) {
  const colors = __ds_scope.categoryColors(category);
  const isFreezer = category === "freezer";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["gr-aisle", className].join(" ")
  }, rest), isFreezer ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: colors.fg,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "snowflake",
    size: 18
  })) : /*#__PURE__*/React.createElement("span", {
    className: "gr-tag__dot",
    style: {
      background: colors.mid,
      width: 10,
      height: 10
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "gr-aisle__name"
  }, __ds_scope.categoryLabel(category)), count != null && /*#__PURE__*/React.createElement("span", {
    className: "gr-aisle__count"
  }, count));
}
Object.assign(__ds_scope, { AisleHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/grocery/AisleHeader.jsx", error: String((e && e.message) || e) }); }

// components/grocery/CategoryTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A small flat chip marking an item's aisle category. Pass a
 * `category` slug to auto-resolve label + color, or override `tone`
 * colors / `children` directly. A leading color dot anchors the
 * shopper's eye to the section color even when chips wrap.
 */
function CategoryTag({
  category,
  children,
  dot = true,
  className = "",
  style,
  ...rest
}) {
  const colors = __ds_scope.categoryColors(category);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ["gr-tag", className].join(" "),
    style: {
      background: colors.bg,
      color: colors.fg,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "gr-tag__dot",
    style: {
      background: colors.mid
    }
  }), children ?? __ds_scope.categoryLabel(category));
}
Object.assign(__ds_scope, { CategoryTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/grocery/CategoryTag.jsx", error: String((e && e.message) || e) }); }

// components/grocery/GroceryItemRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * One row on the grocery list. A big checkoff, the shopper-friendly
 * item text, an optional count badge, and a meta line of store names
 * (+ an optional category chip in mixed/grouped views). When checked,
 * the text strikes through in olive and the row tints.
 *
 * Stateless: the parent owns `checked` and handles `onToggle`. Pass
 * `showCategory` in store-grouped views where the section header isn't
 * already the category.
 */
function GroceryItemRow({
  text,
  quantity = 1,
  category,
  stores = [],
  checked = false,
  onToggle,
  showCategory = false,
  trailing,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["gr-item", checked ? "gr-item--checked" : "", className].join(" ")
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    checked: checked,
    onChange: () => onToggle && onToggle()
  }), /*#__PURE__*/React.createElement("div", {
    className: "gr-item__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gr-item__text"
  }, text), /*#__PURE__*/React.createElement("span", {
    className: "gr-item__meta"
  }, showCategory && category && /*#__PURE__*/React.createElement(__ds_scope.CategoryTag, {
    category: category
  }), stores.length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, stores.join(" · ")))), quantity > 1 && /*#__PURE__*/React.createElement("span", {
    className: "gr-item__qty"
  }, "\xD7", quantity), trailing);
}
Object.assign(__ds_scope, { GroceryItemRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/grocery/GroceryItemRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grocery_app/GroceryApp.jsx
try { (() => {
// GroceryApp — the phone shell that ties the surfaces together: a top bar
// with the brand + household avatars, the Plan/Shop mode toggle, the active
// view, a bottom tab bar, and the toast. Holds the single shared list in
// state so checkoffs, adds, and removes all mutate one source.
const {
  useState,
  useCallback,
  useEffect
} = React;
function GroceryApp({
  initialItems
}) {
  const {
    Brand,
    ModeToggle,
    Avatar,
    IconButton,
    Toast,
    Button
  } = window.GroceryDesignSystem_df55be;
  const {
    HOUSEHOLD,
    MEMORY
  } = window.GroceryData;
  const [items, setItems] = useState(initialItems);
  const [mode, setMode] = useState("plan");
  const [store, setStore] = useState("all");
  const [toast, setToast] = useState(null);
  const flash = useCallback(msg => {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(null), 2400);
  }, []);
  const toggle = useCallback(id => {
    setItems(list => list.map(it => it.id === id ? {
      ...it,
      checked: !it.checked
    } : it));
  }, []);
  const add = useCallback(item => {
    setItems(list => [...list, {
      ...item,
      id: "n" + Date.now() + Math.random().toString(36).slice(2, 5),
      checked: false
    }]);
    flash(`Added ${item.text}`);
  }, [flash]);
  const remove = useCallback(id => {
    setItems(list => list.filter(it => it.id !== id));
  }, []);
  const endTrip = useCallback(() => {
    setItems(list => list.filter(it => !it.checked));
    flash("Trip ended — checked items cleared");
    setMode("plan");
  }, [flash]);
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-app"
  }, /*#__PURE__*/React.createElement("header", {
    className: "gk-topbar"
  }, /*#__PURE__*/React.createElement(Brand, null), /*#__PURE__*/React.createElement("div", {
    className: "gk-topbar__right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-avatars"
  }, HOUSEHOLD.members.slice(0, 3).map(m => /*#__PURE__*/React.createElement(Avatar, {
    key: m.name,
    name: m.name,
    size: 28
  })), /*#__PURE__*/React.createElement("span", {
    className: "gk-avatars__more"
  }, "+1")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "settings",
    "aria-label": "Settings"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "gk-modebar"
  }, /*#__PURE__*/React.createElement(ModeToggle, {
    value: mode,
    onChange: setMode
  }), /*#__PURE__*/React.createElement("span", {
    className: "gk-listmeta count"
  }, items.length, " items")), /*#__PURE__*/React.createElement("main", {
    className: "gk-main"
  }, mode === "plan" ? /*#__PURE__*/React.createElement(window.PlanView, {
    items: items,
    memory: MEMORY,
    onAdd: add,
    onToggle: toggle,
    onRemove: remove
  }) : /*#__PURE__*/React.createElement(window.ShopView, {
    items: items,
    stores: HOUSEHOLD.stores,
    store: store,
    onStore: setStore,
    onToggle: toggle,
    onEndTrip: endTrip
  })), /*#__PURE__*/React.createElement("nav", {
    className: "gk-tabbar"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "gk-tab is-active"
  }, /*#__PURE__*/React.createElement(window.GroceryDesignSystem_df55be.Icon, {
    name: "list-checks",
    size: 22
  }), "List"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "gk-tab"
  }, /*#__PURE__*/React.createElement(window.GroceryDesignSystem_df55be.Icon, {
    name: "store",
    size: 22
  }), "Stores"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "gk-tab"
  }, /*#__PURE__*/React.createElement(window.GroceryDesignSystem_df55be.Icon, {
    name: "users",
    size: 22
  }), "Household")), /*#__PURE__*/React.createElement(Toast, {
    visible: !!toast
  }, toast));
}
window.GroceryApp = GroceryApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grocery_app/GroceryApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grocery_app/PlanView.jsx
try { (() => {
// PlanView — write mode. The whole list grouped by aisle, each row with a
// remembered store/category meta line and an inline edit affordance. A
// sticky add-item composer sits at the bottom with autocomplete from memory.
const {
  useState,
  useMemo,
  useRef
} = React;
function PlanView({
  items,
  onAdd,
  onToggle,
  onRemove,
  memory
}) {
  const {
    AisleHeader,
    GroceryItemRow,
    IconButton,
    Input,
    Button,
    CategoryTag
  } = window.GroceryDesignSystem_df55be;
  const {
    groupByAisle
  } = window.GroceryData;
  const [draft, setDraft] = useState("");
  const groups = useMemo(() => groupByAisle(items), [items]);

  // Autocomplete suggestion from pantry memory.
  const suggestion = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return null;
    return memory.find(m => m.text.toLowerCase().startsWith(q)) || null;
  }, [draft, memory]);
  function commit() {
    const text = draft.trim();
    if (!text) return;
    const remembered = memory.find(m => m.text.toLowerCase() === text.toLowerCase());
    onAdd({
      text,
      qty: 1,
      category: remembered?.category ?? "misc",
      stores: remembered?.stores ?? []
    });
    setDraft("");
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-plan"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll"
  }, groups.map(g => /*#__PURE__*/React.createElement("section", {
    className: "gk-aisle-group",
    key: g.category
  }, /*#__PURE__*/React.createElement(AisleHeader, {
    category: g.category,
    count: g.items.length
  }), g.items.map(it => /*#__PURE__*/React.createElement(GroceryItemRow, {
    key: it.id,
    text: it.text,
    quantity: it.qty,
    stores: it.stores,
    checked: it.checked,
    onToggle: () => onToggle(it.id),
    trailing: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex"
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "pencil",
      size: 18,
      "aria-label": `Edit ${it.text}`
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "trash",
      size: 18,
      variant: "danger",
      "aria-label": `Remove ${it.text}`,
      onClick: () => onRemove(it.id)
    }))
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "gk-composer"
  }, suggestion && suggestion.text.toLowerCase() !== draft.trim().toLowerCase() && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "gk-suggest",
    onClick: () => setDraft(suggestion.text)
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-suggest__text"
  }, suggestion.text), /*#__PURE__*/React.createElement(CategoryTag, {
    category: suggestion.category
  }), /*#__PURE__*/React.createElement("span", {
    className: "count",
    style: {
      marginLeft: "auto"
    }
  }, suggestion.stores.join(" · "))), /*#__PURE__*/React.createElement("div", {
    className: "gk-composer__row"
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Add an item\u2026",
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => e.key === "Enter" && commit()
  }), /*#__PURE__*/React.createElement(Button, {
    icon: "plus",
    onClick: commit,
    "aria-label": "Add item"
  }))));
}
window.PlanView = PlanView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grocery_app/PlanView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grocery_app/ShopView.jsx
try { (() => {
// ShopView — read mode. Items regrouped under the selected store, big
// checkoffs, a sticky store filter, and a live "got it" progress count.
// Within a store the items stay in aisle order so the shopper walks the
// aisles in sequence.
const {
  useState,
  useMemo
} = React;
function ShopView({
  items,
  store,
  onStore,
  onToggle,
  stores,
  onEndTrip
}) {
  const {
    StoreFilter,
    AisleHeader,
    GroceryItemRow,
    Button,
    EmptyState
  } = window.GroceryDesignSystem_df55be;
  const {
    groupByAisle
  } = window.GroceryData;
  const visible = useMemo(() => store === "all" ? items : items.filter(it => it.stores.includes(store)), [items, store]);
  const groups = useMemo(() => groupByAisle(visible), [visible]);
  const remaining = visible.filter(it => !it.checked).length;
  const total = visible.length;
  const allDone = total > 0 && remaining === 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-shop"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-shop__filter"
  }, /*#__PURE__*/React.createElement(StoreFilter, {
    stores: stores,
    value: store,
    onChange: onStore
  })), /*#__PURE__*/React.createElement("div", {
    className: "gk-progress"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, store === "all" ? "All stores" : store), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, total - remaining, "/", total, " in the cart")), /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll"
  }, allDone ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "check",
    title: "All checked off!",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "success",
      icon: "check",
      onClick: onEndTrip
    }, "End trip")
  }, "Nice work. End the trip to clear what you bought for next time.") : groups.map(g => /*#__PURE__*/React.createElement("section", {
    className: "gk-aisle-group",
    key: g.category
  }, /*#__PURE__*/React.createElement(AisleHeader, {
    category: g.category,
    count: g.items.length
  }), g.items.map(it => /*#__PURE__*/React.createElement(GroceryItemRow, {
    key: it.id,
    text: it.text,
    quantity: it.qty,
    stores: store === "all" ? it.stores : [],
    checked: it.checked,
    onToggle: () => onToggle(it.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  })));
}
window.ShopView = ShopView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grocery_app/ShopView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grocery_app/SignIn.jsx
try { (() => {
// SignIn — the entry surface. The launch card (stacked brand + Google
// button, mirroring RecipeTracker's sign-in). Joins the shared household
// list on sign-in.

function SignIn({
  onSignIn
}) {
  const {
    Brand,
    Button
  } = window.GroceryDesignSystem_df55be;
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-signin"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-signin__card"
  }, /*#__PURE__*/React.createElement(Brand, {
    variant: "stacked"
  }), /*#__PURE__*/React.createElement("p", {
    className: "gk-signin__tag"
  }, "One shared list for the whole household. Plan together, shop apart."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "mail",
    onClick: onSignIn,
    className: "gk-signin__btn"
  }, "Continue with Google"), /*#__PURE__*/React.createElement("span", {
    className: "caption gk-signin__foot"
  }, "You'll join the ", /*#__PURE__*/React.createElement("strong", null, "Marks Family"), " list.")));
}
window.SignIn = SignIn;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grocery_app/SignIn.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grocery_app/data.js
try { (() => {
// Fake household + list data for the Grocery UI kit. Shape mirrors the
// PLAN.md data model: one shared list, items tagged by category + stores,
// a remembered-items "pantry memory", and a RecipeTracker import payload.

const HOUSEHOLD = {
  name: "Marks Family",
  members: [{
    name: "Justin Marks",
    you: true
  }, {
    name: "Sarah Park"
  }, {
    name: "Theo Marks"
  }, {
    name: "Mara Lee"
  }],
  stores: ["Trader Joe's", "Costco", "QFC"]
};

// The shared list. `checked` is the shopping-mode bought state.
const ITEMS = [{
  id: "i1",
  text: "Lemons",
  qty: 1,
  category: "fruits",
  stores: ["Trader Joe's", "QFC"],
  checked: false
}, {
  id: "i2",
  text: "Bananas",
  qty: 6,
  category: "fruits",
  stores: ["Trader Joe's"],
  checked: false
}, {
  id: "i3",
  text: "Yellow onions",
  qty: 3,
  category: "vegetables",
  stores: ["QFC"],
  checked: false
}, {
  id: "i4",
  text: "Romaine hearts",
  qty: 1,
  category: "vegetables",
  stores: ["Trader Joe's", "Costco"],
  checked: true
}, {
  id: "i5",
  text: "Carrots",
  qty: 1,
  category: "vegetables",
  stores: ["Costco"],
  checked: false
}, {
  id: "i6",
  text: "Ground beef",
  qty: 2,
  category: "meats",
  stores: ["Costco"],
  checked: false
}, {
  id: "i7",
  text: "Chicken thighs",
  qty: 1,
  category: "meats",
  stores: ["Costco"],
  checked: false
}, {
  id: "i8",
  text: "Whole milk",
  qty: 2,
  category: "dairy",
  stores: ["Costco", "QFC"],
  checked: false
}, {
  id: "i9",
  text: "Greek yogurt",
  qty: 1,
  category: "dairy",
  stores: ["Trader Joe's"],
  checked: true
}, {
  id: "i10",
  text: "Sharp cheddar",
  qty: 1,
  category: "cheeses",
  stores: ["Trader Joe's"],
  checked: false
}, {
  id: "i11",
  text: "All-purpose flour",
  qty: 1,
  category: "baking-and-dry-goods",
  stores: ["Costco"],
  checked: false
}, {
  id: "i12",
  text: "Sourdough loaf",
  qty: 1,
  category: "bread-and-crackers",
  stores: ["Trader Joe's"],
  checked: false
}, {
  id: "i13",
  text: "Sparkling water",
  qty: 12,
  category: "beverages",
  stores: ["Costco"],
  checked: false
}, {
  id: "i14",
  text: "Paper towels",
  qty: 1,
  category: "paper-goods",
  stores: ["Costco"],
  checked: false
}, {
  id: "i15",
  text: "Frozen peas",
  qty: 2,
  category: "freezer",
  stores: ["Costco"],
  checked: false
}, {
  id: "i16",
  text: "Vanilla ice cream",
  qty: 1,
  category: "freezer",
  stores: ["QFC"],
  checked: false
}];

// "Remembers what you've bought" — typing autocompletes with the usual
// category + stores. A handful of remembered items for the add-item flow.
const MEMORY = [{
  text: "Eggs",
  category: "dairy",
  stores: ["Costco", "QFC"]
}, {
  text: "Avocados",
  category: "fruits",
  stores: ["Trader Joe's"]
}, {
  text: "Olive oil",
  category: "baking-and-dry-goods",
  stores: ["Costco"]
}, {
  text: "Tortillas",
  category: "bread-and-crackers",
  stores: ["Trader Joe's"]
}, {
  text: "Butter",
  category: "dairy",
  stores: ["Costco"]
}, {
  text: "Spinach",
  category: "vegetables",
  stores: ["Trader Joe's", "QFC"]
}];

// Canonical store-walk order for aisle grouping.
const CATEGORY_ORDER = ["fruits", "vegetables", "meats", "dairy", "cheeses", "baking-and-dry-goods", "bread-and-crackers", "beverages", "paper-goods", "freezer", "misc"];
function groupByAisle(items) {
  const groups = {};
  for (const it of items) (groups[it.category] ??= []).push(it);
  return CATEGORY_ORDER.filter(c => groups[c]?.length).map(c => ({
    category: c,
    items: groups[c]
  }));
}
window.GroceryData = {
  HOUSEHOLD,
  ITEMS,
  MEMORY,
  CATEGORY_ORDER,
  groupByAisle
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grocery_app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Brand = __ds_scope.Brand;

__ds_ns.Monogram = __ds_scope.Monogram;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.AisleHeader = __ds_scope.AisleHeader;

__ds_ns.CategoryTag = __ds_scope.CategoryTag;

__ds_ns.GroceryItemRow = __ds_scope.GroceryItemRow;

__ds_ns.ModeToggle = __ds_scope.ModeToggle;

__ds_ns.StoreFilter = __ds_scope.StoreFilter;

__ds_ns.CATEGORIES = __ds_scope.CATEGORIES;

__ds_ns.CATEGORY_BY_SLUG = __ds_scope.CATEGORY_BY_SLUG;

})();
