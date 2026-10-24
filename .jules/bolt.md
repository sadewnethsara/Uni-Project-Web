## 2024-05-24 - [Avoid continuous scroll state]
**Learning:** Storing the raw window scroll coordinate (e.g. `window.scrollY`) in a React state variable causes the component to re-render on *every single scroll tick*. When this state is used as a dependency in a `useEffect` that attaches a scroll listener, it forces the listener to be constantly removed and re-attached, destroying performance.
**Action:** When determining visibility or threshold states on scroll, compute the boolean condition (`window.scrollY > 10`) and only update state if that boolean value changes (which React `useState` does implicitly when setting the same primitive boolean). Do not store the raw scroll number in state unless absolutely necessary for an animation frame, and even then prefer `useMotionValue` or similar non-react-state primitives.

## 2024-05-24 - [Avoid O(N) redundant iterations with intermediate memoization]
**Learning:** When a large array (like `apiPrices`) is iterated over multiple times in separate `useMemo` hooks using similar filter criteria, it causes significant performance overhead during renders.
**Action:** Extract the common filter criteria into a single, intermediate `useMemo` hook (e.g., `selectedCommodityPrices`) and use this pre-filtered, smaller array in the subsequent hooks to prevent redundant O(N) traversals.
