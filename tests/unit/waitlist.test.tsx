import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WaitlistForm } from "@/components/download/WaitlistForm";

const ENDPOINT = "https://forms.example.com/briefnest";

function setup(response: Response | Error = new Response("{}", { status: 200 })) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<WaitlistForm endpoint={ENDPOINT} />);
  return {
    user: userEvent.setup(),
    fetchMock,
    email: screen.getByLabelText("Email address"),
    consent: screen.getByRole("checkbox"),
    submit: screen.getByRole("button", { name: "Request early access" }),
  };
}

describe("early-access form", () => {
  it("asks for an email before sending anything", async () => {
    const { user, fetchMock, email, submit } = setup();
    await user.click(submit);
    expect(screen.getByText("Enter your email address.")).toBeVisible();
    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription("Enter your email address.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects something that isn't an email address", async () => {
    const { user, fetchMock, email, consent, submit } = setup();
    await user.type(email, "mira at inknest");
    await user.click(consent);
    await user.click(submit);
    expect(screen.getByText(/doesn’t look like an email address/)).toBeVisible();
    expect(email).toBeInvalid();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("needs explicit consent", async () => {
    const { user, fetchMock, email, consent, submit } = setup();
    await user.type(email, "mira@inknest.example");
    await user.click(submit);
    expect(screen.getByText("Tick the box so we can email you.")).toBeVisible();
    expect(consent).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the request and confirms only when the endpoint accepts it", async () => {
    const { user, fetchMock, email, consent, submit } = setup();
    await user.type(email, "  mira@inknest.example ");
    await user.click(consent);
    await user.click(submit);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ email: "mira@inknest.example", consent: true, source: "briefnest-website" });
    expect(await screen.findByText("Request sent.")).toBeVisible();
  });

  it("says so when the endpoint refuses, and never claims success", async () => {
    const { user, email, consent, submit } = setup(new Response("nope", { status: 500 }));
    await user.type(email, "mira@inknest.example");
    await user.click(consent);
    await user.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("Your request wasn’t sent. The server answered 500.");
    expect(screen.queryByText("Request sent.")).not.toBeInTheDocument();
  });

  it("says so when the network fails", async () => {
    const { user, email, consent, submit } = setup(new TypeError("Failed to fetch"));
    await user.type(email, "mira@inknest.example");
    await user.click(consent);
    await user.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("Your request wasn’t sent. Check your connection and try again.");
  });

  it("drops submissions that fill the hidden field", async () => {
    const { user, fetchMock, email, consent, submit } = setup();
    await user.type(email, "bot@example.com");
    await user.click(consent);
    // Bots fill every input; people never see this one.
    const trap = document.querySelector<HTMLInputElement>('input[name="company"]')!;
    trap.value = "Acme";
    await user.click(submit);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
