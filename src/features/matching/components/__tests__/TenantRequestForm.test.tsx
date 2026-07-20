import { render, screen } from "@testing-library/react";
import { TenantRequestForm } from "../TenantRequestForm";
import { useVerificationState } from "@/src/features/ekyc/hooks/useKyc";
import { useCreateTenantRequest } from "../../hooks/useTenantRequests";

jest.mock("@/src/features/ekyc/hooks/useKyc", () => ({ useVerificationState: jest.fn() }));
jest.mock("../../hooks/useTenantRequests", () => ({ useCreateTenantRequest: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/src/components/ui/Toast", () => ({ useToast: () => jest.fn() }));

const mockedVerification = jest.mocked(useVerificationState);
const mockedCreate = jest.mocked(useCreateTenantRequest);

describe("TenantRequestForm verification integration", () => {
  beforeEach(() => {
    mockedCreate.mockReturnValue({ mutate: jest.fn(), isPending: false } as ReturnType<typeof useCreateTenantRequest>);
  });

  it("does not render or invoke the protected tenant-request mutation while verification is unapproved", () => {
    mockedVerification.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { status: "NOT_SUBMITTED", rejectionReason: null, submittedAt: null, reviewedAt: null, canSubmit: true },
      refetch: jest.fn(),
    } as ReturnType<typeof useVerificationState>);

    render(<TenantRequestForm />);

    expect(screen.getByRole("link", { name: "ابدأ توثيق الهوية" })).toHaveAttribute("href", "/verify");
    expect(screen.queryByRole("button", { name: "إرسال الطلب للمراجعة" })).not.toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("renders the tenant request workflow when verification is approved", () => {
    mockedVerification.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { status: "APPROVED", rejectionReason: null, submittedAt: "2026-07-20T12:00:00.000Z", reviewedAt: null, canSubmit: false },
      refetch: jest.fn(),
    } as ReturnType<typeof useVerificationState>);

    render(<TenantRequestForm />);

    expect(screen.getByRole("button", { name: "إرسال الطلب للمراجعة" })).toBeInTheDocument();
  });
});
