import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CategoryBadge from "../expenses/CategoryBadge";
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from "@/lib/constants";
import type { ExpenseCategory } from "@/types";

describe("CategoryBadge", () => {
  it.each(EXPENSE_CATEGORIES)(
    "should render the category text for %s",
    (category) => {
      render(<CategoryBadge category={category} />);
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  );

  it.each(EXPENSE_CATEGORIES)(
    "should apply the correct background and text color for %s",
    (category) => {
      render(<CategoryBadge category={category} />);
      const badge = screen.getByText(category);
      const colors = CATEGORY_COLORS[category];

      expect(badge).toHaveStyle({
        backgroundColor: colors.bg,
        color: colors.text,
      });
    }
  );

  it("should render as an inline span element", () => {
    render(<CategoryBadge category="Food" />);
    const badge = screen.getByText("Food");
    expect(badge.tagName).toBe("SPAN");
  });
});
