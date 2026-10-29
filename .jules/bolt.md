## 2024-05-24 - [Avoid continuous scroll state]
**Learning:** Storing the raw window scroll coordinate (e.g. `window.scrollY`) in a React state variable causes the component to re-render on *every single scroll tick*. When this state is used as a dependency in a `useEffect` that attaches a scroll listener, it forces the listener to be constantly removed and re-attached, destroying performance.
**Action:** When determining visibility or threshold states on scroll, compute the boolean condition (`window.scrollY > 10`) and only update state if that boolean value changes (which React `useState` does implicitly when setting the same primitive boolean). Do not store the raw scroll number in state unless absolutely necessary for an animation frame, and even then prefer `useMotionValue` or similar non-react-state primitives.

## 2024-05-24 - [Avoid redundant O(N) traversals across multiple useMemo hooks]
**Learning:** When processing large datasets (like `apiPrices` containing thousands of entries) across multiple dependent `useMemo` hooks, performing full array scans repeatedly in each hook is highly inefficient and can block the main thread during renders.
**Action:** Create an intermediate memoized array (e.g., pre-filtered by ID) to shrink the dataset size before it's passed into subsequent `useMemo` hooks. This replaces multiple O(N) traversals with a single O(N) filter step.
