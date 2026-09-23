import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RsvpFormModal } from "@/components/shared/RsvpFormModal";

describe("RsvpFormModal typography", () => {
  it("uses the UI sans font instead of inheriting the invitation font", () => {
    render(
      <div style={{ fontFamily: "Playfair Display" }}>
        <RsvpFormModal
          isOpen
          onClose={vi.fn()}
          cardId="demo-card"
        />
      </div>,
    );

    const heading = screen.getByRole("heading", { level: 2 });

    expect(heading.closest(".font-sans")).not.toBeNull();
  });
});
