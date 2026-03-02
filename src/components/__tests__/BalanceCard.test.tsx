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

  it("should display a positive balance with a + prefix", () => {
    render(
      <BalanceCard balance={positiveBalance} maxAbsolute={25} currency="USD" />
    );
    const amountEl = screen.getByText(/\+.*\$25/);
    expect(amountEl).toBeInTheDocument();
    // Uses inline style with teal color for positive
    expect(amountEl).toHaveStyle({ color: "#14B8A6" });
  });

  it("should display a negative balance with red color", () => {
    render(
      <BalanceCard balance={negativeBalance} maxAbsolute={25} currency="USD" />
    );
    const amountEl = screen.getByText(/15\.50/);
    expect(amountEl).toBeInTheDocument();
    expect(amountEl).toHaveStyle({ color: "#EF4444" });
  });

  it("should use teal color for a zero balance", () => {
    render(
      <BalanceCard balance={zeroBalance} maxAbsolute={25} currency="USD" />
    );
    const amountEl = screen.getByText(/\$0/);
    expect(amountEl).toHaveStyle({ color: "#14B8A6" });
  });

  it("should render a progress bar with correct width for positive balance", () => {
    const { container } = render(
      <BalanceCard balance={positiveBalance} maxAbsolute={50} currency="USD" />
    );
    // 25 / 50 = 50%
    const bar = container.querySelector("[style*='width: 50%']");
    expect(bar).toBeInTheDocument();
  });

  it("should render a progress bar with teal color for positive balance", () => {
    const { container } = render(
      <BalanceCard balance={positiveBalance} maxAbsolute={25} currency="USD" />
    );
    const innerBar = container.querySelector(
      "[style*='background-color: rgb(20, 184, 166)']"
    );
    expect(innerBar).toBeInTheDocument();
  });

  it("should render a progress bar with red color for negative balance", () => {
    const { container } = render(
      <BalanceCard balance={negativeBalance} maxAbsolute={25} currency="USD" />
    );
    const innerBar = container.querySelector(
      "[style*='background-color: rgb(239, 68, 68)']"
    );
    expect(innerBar).toBeInTheDocument();
  });

  it("should render 0% width bar when maxAbsolute is 0", () => {
    const { container } = render(
      <BalanceCard balance={positiveBalance} maxAbsolute={0} currency="USD" />
    );
    const bar = container.querySelector("[style*='width: 0%']");
    expect(bar).toBeInTheDocument();
  });
});
