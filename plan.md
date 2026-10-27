1. Add an intermediate memoized array `commodityPrices` in `src/app/(main)/markets/[[...market]]/page.tsx` just before `comparison`.
```tsx
  const commodityPrices = useMemo(() => {
    if (!selectedCommodityId || apiPrices.length === 0) return [];
    return apiPrices.filter(p => p.vegetable_id === selectedCommodityId);
  }, [selectedCommodityId, apiPrices]);
```
2. Update the `comparison` useMemo hook in `src/app/(main)/markets/[[...market]]/page.tsx` to use `commodityPrices` and remove the redundant `selectedCommodityId` check and filtering.
3. Update the `sparkline` useMemo hook in `src/app/(main)/markets/[[...market]]/page.tsx` to use `commodityPrices` and remove the redundant `selectedCommodityId` check and filtering.
4. Update the `lowestPrice` useMemo hook in `src/app/(main)/markets/[[...market]]/page.tsx` to use `commodityPrices` and remove the redundant `selectedCommodityId` check and filtering.
5. Update the `highestPrice` useMemo hook in `src/app/(main)/markets/[[...market]]/page.tsx` to use `commodityPrices` and remove the redundant `selectedCommodityId` check and filtering.
6. Update the `weeklyMarketPrices` useMemo hook in `src/app/(main)/markets/[[...market]]/page.tsx` to use `commodityPrices` and remove the redundant `selectedCommodityId` check and filtering.
7. Run `pnpm lint` and `pnpm build`.
8. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
9. Submit the Pull Request.
