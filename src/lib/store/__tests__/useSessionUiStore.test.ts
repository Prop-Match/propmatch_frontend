import { act, renderHook } from "@testing-library/react";
import { useSessionUiStore } from "../useSessionUiStore";

describe("useSessionUiStore", () => {
  it("defaults to the tenant role context", () => {
    const { result } = renderHook(() => useSessionUiStore());
    expect(result.current.activeRoleContext).toBe("tenant");
  });

  it("switches role context for dual-role (الاثنين) accounts", () => {
    const { result } = renderHook(() => useSessionUiStore());
    act(() => result.current.setActiveRoleContext("landlord"));
    expect(result.current.activeRoleContext).toBe("landlord");
  });
});
