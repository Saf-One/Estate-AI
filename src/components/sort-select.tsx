"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui";

export default function SortSelect({
  value,
  baseQuery,
}: {
  value: string;
  baseQuery: string;
}) {
  const router = useRouter();

  return (
    <Select
      className="w-44"
      defaultValue={value}
      onChange={(e) => {
        const sort = e.target.value;
        const params = new URLSearchParams(baseQuery);
        if (sort !== "newest") params.set("sort", sort);
        else params.delete("sort");
        params.delete("page");
        router.push(`/listings?${params.toString()}`);
      }}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </Select>
  );
}
