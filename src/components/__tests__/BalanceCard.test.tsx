import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BalanceCard from "../settlement/BalanceCard";

describe("BalanceCard", () => {
  it("should display the member name", () => {
    render(
      <BalanceCard memberName="Alice" entries={[{ currency: "USD", net: 25 }]} colorIndex={0} />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("should display a positive balance with a + prefix", () => {
    render(
      <BalanceCard memberName="Alice" entries={[{ currency: "USD", net: 25 }]} colorIndex={0} />
    );
    const amountEl = screen.getByText(/\+.*\$25/);
    expect(amountEl).toBeInTheDocument();
    expect(amountEl).toHaveStyle({ color: "#059669" });
  });

  it("should display a negative balance with red color", () => {
    render(
      <BalanceCard memberName="Bob" entries={[{ currency: "USD", net: -15.5 }]} colorIndex={1} />
    );
    const amountEl = screen.getByText(/15\.50/);
    expect(amountEl).toBeInTheDocument();
    expect(amountEl).toHaveStyle({ color: "#DC2626" });
  });

  it("should use green color for a zero balance", () => {
    render(
      <BalanceCard memberName="Charlie" entries={[{ currency: "USD", net: 0 }]} colorIndex={2} />
    );
    const amountEl = screen.getByText(/\$0/);
    expect(amountEl).toHaveStyle({ color: "#059669" });
  });

  it("should show currency badges when multiple entries", () => {
    render(
      <BalanceCard
        memberName="Alice"
        entries={[
          { currency: "MYR", net: 120 },
          { currency: "USD", net: 50 },
        ]}
        colorIndex={0}
      />
    );
    expect(screen.getByText("MYR")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("should not show currency badge for single entry", () => {
    render(
      <BalanceCard memberName="Alice" entries={[{ currency: "USD", net: 25 }]} colorIndex={0} />
    );
    expect(screen.queryByText("USD")).not.toBeInTheDocument();
  });

  it("should render a progress bar with green color for positive balance", () => {
    const { container } = render(
      <BalanceCard memberName="Alice" entries={[{ currency: "USD", net: 25 }]} colorIndex={0} />
    );
    const innerBar = container.querySelector(
      "[style*='background-color: rgb(5, 150, 105)']"
    );
    expect(innerBar).toBeInTheDocument();
  });

  it("should render a progress bar with red color for negative balance", () => {
    const { container } = render(
      <BalanceCard memberName="Bob" entries={[{ currency: "USD", net: -15.5 }]} colorIndex={1} />
    );
    const innerBar = container.querySelector(
      "[style*='background-color: rgb(220, 38, 38)']"
    );
    expect(innerBar).toBeInTheDocument();
  });
});
