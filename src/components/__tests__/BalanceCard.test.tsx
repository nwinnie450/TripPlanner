import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BalanceCard from "../settlement/BalanceCard";
import type { Balance } from "@/types";

describe("BalanceCard", () => {
  const positiveBalance: Balance = {
    memberId: "a",
    memberName: "Alice",
    net: 25.0,
  };

  const negativeBalance: Balance = {
    memberId: "b",
    memberName: "Bob",
    net: -15.5,
  };

  const zeroBalance: Balance = {
    memberId: "c",
    memberName: "Charlie",
    net: 0,
  };

  it("should display the member name", () => {
    render(
      <BalanceCard balance={positiveBalance} maxAbsolute={25} currency="USD" />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("should display a positive balance with a + prefix and text-forest class", () => {
    render(
      <BalanceCard balance={positiveBalance} maxAbsolute={25} currency="USD" />
    );
    const amountEl = screen.getByText(/\+.*\$25\.00/);
    expect(amountEl).toBeInTheDocument();
    expect(amountEl.className).toContain("text-forest");
  });

  it("should display a negative balance with text-sunset class", () => {
    render(
      <BalanceCard balance={negativeBalance} maxAbsolute={25} currency="USD" />
    );
    // Negative formatting from Intl may include a minus sign
    const amountEl = screen.getByText(/15\.50/);
    expect(amountEl).toBeInTheDocument();
    expect(amountEl.className).toContain("text-sunset");
  });

  it("should use text-forest for a zero balance", () => {
    render(
      <BalanceCard balance={zeroBalance} maxAbsolute={25} currency="USD" />
    );
    const amountEl = screen.getByText(/\$0\.00/);
    expect(amountEl.className).toContain("text-forest");
  });

  it("should render a progress bar with correct width for positive balance", () => {
    const { container } = render(
      <BalanceCard balance={positiveBalance} maxAbsolute={50} currency="USD" />
    );
    // 25 / 50 = 50%
    const bar = container.querySelector("[style*='width']");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("should render a progress bar with bg-forest for positive balance", () => {
    const { container } = render(
      <BalanceCard balance={positiveBalance} maxAbsolute={25} currency="USD" />
    );
    const innerBar = container.querySelector(".bg-forest");
    expect(innerBar).toBeInTheDocument();
  });

  it("should render a progress bar with bg-sunset for negative balance", () => {
    const { container } = render(
      <BalanceCard balance={negativeBalance} maxAbsolute={25} currency="USD" />
    );
    const innerBar = container.querySelector(".bg-sunset");
    expect(innerBar).toBeInTheDocument();
  });

  it("should render 0% width bar when maxAbsolute is 0", () => {
    const { container } = render(
      <BalanceCard balance={positiveBalance} maxAbsolute={0} currency="USD" />
    );
    const bar = container.querySelector("[style*='width']");
    expect(bar).toHaveStyle({ width: "0%" });
  });
});
