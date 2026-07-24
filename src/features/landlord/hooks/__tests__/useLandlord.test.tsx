import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { api } from "@/src/lib/api/browserClient";
import { useCreateProperty } from "../useLandlord";

jest.mock("@/src/lib/api/browserClient", () => {
  const actual = jest.requireActual("@/src/lib/api/browserClient");
  return { ...actual, api: { ...actual.api, post: jest.fn() } };
});

const mockedPost = jest.mocked(api.post);

function apiError(code: string, statusCode = 403) {
  return Object.assign(new Error("رفض الخادم"), {
    name: "ApiClientError",
    statusCode,
    body: { code },
  });
}

describe("useCreateProperty", () => {
  beforeEach(() => mockedPost.mockReset());

  it("waits for the exact canonical verification refetch after VERIFICATION_REQUIRED", async () => {
    mockedPost.mockRejectedValue(apiError("VERIFICATION_REQUIRED"));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const refetch = jest.spyOn(queryClient, "refetchQueries");
    let resolveRefetch: (() => void) | undefined;
    refetch.mockImplementation(() => new Promise<void>((resolve) => { resolveRefetch = resolve; }));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateProperty(), { wrapper });

    const mutation = result.current.mutateAsync({} as never).catch((error) => error);
    await waitFor(() => expect(refetch).toHaveBeenCalledWith({ queryKey: ["verification"], exact: true }));
    expect(mockedPost).toHaveBeenCalledTimes(1);
    resolveRefetch?.();
    await expect(mutation).resolves.toMatchObject({ code: "VERIFICATION_REQUIRED" });
    expect(mockedPost).toHaveBeenCalledTimes(1);
  });

  it("does not refetch verification for an unrelated 403", async () => {
    mockedPost.mockRejectedValue(apiError("CAPABILITY_REQUIRED"));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const refetch = jest.spyOn(queryClient, "refetchQueries");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateProperty(), { wrapper });

    await expect(result.current.mutateAsync({} as never)).rejects.toMatchObject({ code: "CAPABILITY_REQUIRED" });
    expect(refetch).not.toHaveBeenCalled();
  });
});
