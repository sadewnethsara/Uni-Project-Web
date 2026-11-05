## 2024-05-24 - [Avoid continuous scroll state]
**Learning:** Storing the raw window scroll coordinate (e.g. `window.scrollY`) in a React state variable causes the component to re-render on *every single scroll tick*. When this state is used as a dependency in a `useEffect` that attaches a scroll listener, it forces the listener to be constantly removed and re-attached, destroying performance.
**Action:** When determining visibility or threshold states on scroll, compute the boolean condition (`window.scrollY > 10`) and only update state if that boolean value changes (which React `useState` does implicitly when setting the same primitive boolean). Do not store the raw scroll number in state unless absolutely necessary for an animation frame, and even then prefer `useMotionValue` or similar non-react-state primitives.

## 2024-05-25 - [Pre-filter large datasets for dependent useMemos]
**Learning:** When multiple `useMemo` hooks process the same large dataset (like `apiPrices`) by filtering on a common ID (e.g., `selectedCommodityId`), it causes redundant O(N) traversals on every render or dependency change.
**Action:** Create an intermediate memoized array (pre-filtered by the common ID) and use it as the dependency for the subsequent `useMemo` hooks to prevent redundant full-dataset traversals.
