## 2024-05-24 - [Avoid continuous scroll state]
**Learning:** Storing the raw window scroll coordinate (e.g. `window.scrollY`) in a React state variable causes the component to re-render on *every single scroll tick*. When this state is used as a dependency in a `useEffect` that attaches a scroll listener, it forces the listener to be constantly removed and re-attached, destroying performance.
**Action:** When determining visibility or threshold states on scroll, compute the boolean condition (`window.scrollY > 10`) and only update state if that boolean value changes (which React `useState` does implicitly when setting the same primitive boolean). Do not store the raw scroll number in state unless absolutely necessary for an animation frame, and even then prefer `useMotionValue` or similar non-react-state primitives.

## 2024-05-24 - [Avoid O(N) traversals on dependent useMemo]
**Learning:** Having multiple `useMemo` hooks all iterate over the same large dataset (like `apiPrices`) and re-apply identical filter conditions (e.g., `vegetable_id === selectedCommodityId`) scales poorly as the dataset grows.
**Action:** Always pre-filter the large dataset in a single upstream `useMemo` hook (e.g., `commodityPrices`) and pass that intermediate, memoized array to the downstream compute hooks to avoid redundant O(N) traversals on every dependency change.
