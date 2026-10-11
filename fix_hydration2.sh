sed -i 's/style={{ width: "var(--left-width)" }}/ /g' ./src/app/page.tsx
sed -i 's/style={{ width: "var(--right-width)" }}/ /g' ./src/app/page.tsx
sed -i 's/className={`${mobileGisTab === "panel" ? "flex" : "hidden"} lg:flex flex-col gap-4 overflow-y-auto custom-scrollbar min-h-0 pr-1 shrink-0`}/className={`${mobileGisTab === "panel" ? "flex w-full" : "hidden"} lg:flex lg:w-[var(--left-width)] flex-col gap-4 overflow-y-auto custom-scrollbar min-h-0 pr-1 shrink-0`}/g' ./src/app/page.tsx
sed -i 's/className={`${mobileGisTab === "map" ? "flex" : "hidden"} lg:flex flex-col gap-3 h-full min-h-0 relative shrink-0`}/className={`${mobileGisTab === "map" ? "flex w-full" : "hidden"} lg:flex lg:w-[var(--right-width)] flex-col gap-3 h-full min-h-0 relative shrink-0`}/g' ./src/app/page.tsx
