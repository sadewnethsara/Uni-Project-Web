## 2024-05-24 - [Avoid continuous scroll state]
**Learning:** Storing the raw window scroll coordinate (e.g. `window.scrollY`) in a React state variable causes the component to re-render on *every single scroll tick*. When this state is used as a dependency in a `useEffect` that attaches a scroll listener, it forces the listener to be constantly removed and re-attached, destroying performance.
**Action:** When determining visibility or threshold states on scroll, compute the boolean condition (`window.scrollY > 10`) and only update state if that boolean value changes (which React `useState` does implicitly when setting the same primitive boolean). Do not store the raw scroll number in state unless absolutely necessary for an animation frame, and even then prefer `useMotionValue` or similar non-react-state primitives.

## 2024-05-25 - [Pre-filter large datasets for multiple useMemo hooks]
**Learning:** When multiple dependent `useMemo` hooks need to process a large dataset based on the same filter criteria (e.g. `apiPrices.filter((p) => p.id === selectedId)`), repeatedly performing this O(N) filtering inside each hook causes redundant traversals during renders.
**Action:** Create an intermediate memoized array that pre-filters the large dataset. Then, have the dependent `useMemo` hooks use this intermediate array and its dependencies, avoiding redundant O(N) iterations.
