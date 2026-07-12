"use client";

import { Select } from "@/components/ui";

export default function SortSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select
      className={className}
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </Select>
  );
}
