import { expect, test } from "@playwright/test";

test.describe("the film", () => {
  test("opens in a dialog, plays with captions, and returns focus when closed", async ({ page, isMobile, browserName }) => {
    await page.goto("/");
    const trigger = page.getByRole("link", { name: "Watch the Film" }).first();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: /The Briefnest film/ });
    await expect(dialog).toBeVisible();
    const player = dialog.getByRole("group", { name: /Video player/ });
    await expect(player).toBeVisible();

    const video = player.locator("video");
    // Phones get the 720p file; everything else gets 1080p, AV1 where it can be decoded.
    const source = await video.evaluate(async (element: HTMLVideoElement) => {
      for (let i = 0; i < 100 && !element.currentSrc; i++) await new Promise((resolve) => setTimeout(resolve, 50));
      return element.currentSrc;
    });
    expect(source).toMatch(isMobile ? /briefnest-film-720p\.mp4$/ : /briefnest-film-1080p(\.av1)?\.mp4$/);
    expect(source).not.toMatch(/4k/);

    const canPlay = await video.evaluate((element: HTMLVideoElement) => element.canPlayType('video/mp4; codecs="avc1.640029, mp4a.40.2"') !== "");
    test.skip(!canPlay, "This browser build has no H.264/AAC decoder (Playwright's bundled Chromium). Run with installed Chrome.");

    // It starts by itself after the click; if the browser holds autoplay back, the large play button starts it.
    const bigPlay = player.getByRole("button", { name: /^(Play|Resume) the film$/ });
    await expect
      .poll(
        async () => {
          const time = await video.evaluate((element: HTMLVideoElement) => (element.paused ? -1 : element.currentTime));
          if (time < 0 && (await bigPlay.isVisible())) await bigPlay.click({ timeout: 1000 }).catch(() => {});
          return time;
        },
        { timeout: 20_000 },
      )
      .toBeGreaterThan(0.4);
    expect(await video.evaluate((element: HTMLVideoElement) => element.duration)).toBeCloseTo(60, 0);

    // Captions: on, and the first line of narration shows.
    await player.focus();
    await page.keyboard.press("c");
    await expect(player.getByRole("button", { name: "Turn captions off" })).toBeVisible();
    await video.evaluate((element: HTMLVideoElement) => (element.currentTime = 0.8));
    await expect(player.getByText("Great ideas happen in meetings.")).toBeVisible({ timeout: 10_000 });

    // Keyboard: pause, seek, mute.
    await page.keyboard.press("k");
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
    const before = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(before + 4);
    await page.keyboard.press("m");
    await expect(player.getByRole("button", { name: "Unmute" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("dialog.film-dialog video")).toHaveCount(0);
    // Chrome focuses a link when it is clicked, so the dialog hands focus back to it. Safari doesn't focus
    // links on click, so there the same check only applies to keyboard use.
    if (browserName === "chromium") await expect(trigger).toBeFocused();
  });

  test("closes from its close button and from the dimmed area", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Watch the Film" }).first().click();
    const dialog = page.getByRole("dialog", { name: /The Briefnest film/ });
    await dialog.getByRole("button", { name: "Close the film" }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole("link", { name: "Watch the Film" }).first().click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test("the hero shows its poster at once and offers the film as a real link", async ({ page }) => {
    await page.goto("/");
    const poster = page.getByRole("img", { name: /Title frame of the Briefnest film/ });
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("link", { name: /Watch the Briefnest film, one minute/ })).toHaveAttribute("href", "/videos/briefnest-film-1080p.mp4");
  });

  test("a phone keeps the poster and downloads no video until someone asks for the film", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone-sized screens only.");
    const videoRequests: string[] = [];
    page.on("request", (request) => request.url().endsWith(".mp4") && videoRequests.push(request.url()));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500);
    await expect(page.locator("section video")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /silent preview/ })).toHaveCount(0);
    expect(videoRequests).toEqual([]);

    await page.getByRole("link", { name: /Watch the Briefnest film, one minute/ }).click();
    await expect(page.getByRole("dialog", { name: /The Briefnest film/ })).toBeVisible();
    await expect.poll(() => videoRequests.some((url) => url.endsWith("briefnest-film-720p.mp4"))).toBe(true);
  });

  test("the silent preview starts by itself, can be paused, and is never loaded for reduced motion", async ({ browser, isMobile }) => {
    test.skip(isMobile, "Covered on desktop; phones behave the same way.");
    const moving = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await moving.newPage();
    await page.goto("/");
    const pause = page.getByRole("button", { name: "Pause the silent preview" });
    await expect(pause).toBeVisible({ timeout: 10_000 });
    const preview = page.locator('section video[aria-hidden="true"]').first();
    await expect(preview).toBeAttached();
    expect(await preview.evaluate((element: HTMLVideoElement) => element.muted && element.loop)).toBe(true);
    await pause.click();
    await expect(page.getByRole("button", { name: "Play the silent preview" })).toBeVisible();
    await expect.poll(() => preview.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
    await moving.close();

    const still = await browser.newContext({ reducedMotion: "reduce" });
    const quiet = await still.newPage();
    const videoRequests: string[] = [];
    quiet.on("request", (request) => request.url().includes("/videos/") && request.url().endsWith(".mp4") && videoRequests.push(request.url()));
    await quiet.goto("/");
    await quiet.waitForLoadState("networkidle");
    await quiet.waitForTimeout(2500);
    await expect(quiet.locator("section video")).toHaveCount(0);
    expect(videoRequests).toEqual([]);
    await still.close();
  });
});

test.describe("navigation", () => {
  test("the header reaches every page and section", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones use the menu sheet; see the next test.");
    await page.goto("/");
    const header = page.getByRole("banner");
    const nav = header.getByRole("navigation", { name: "Main" });

    await nav.getByRole("link", { name: "Features" }).click();
    await expect(page).toHaveURL(/\/features$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything Briefnest does");

    await nav.getByRole("link", { name: "How It Works" }).click();
    await expect(page).toHaveURL(/\/#how-it-works$/);
    await expect(page.locator("#how-it-works")).toBeInViewport();

    await nav.getByRole("link", { name: "FAQ" }).click();
    await expect(page.locator("#faq")).toBeInViewport();

    await nav.getByRole("link", { name: "Product" }).click();
    await expect(page.locator("#product")).toBeInViewport();

    await nav.getByRole("link", { name: "Download" }).click();
    await expect(page).toHaveURL(/\/download$/);

    await header.getByRole("link", { name: "Get Briefnest" }).click();
    await expect(page).toHaveURL(/\/download$/);
    await header.getByRole("link", { name: "Briefnest home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("the menu sheet opens, traps focus, closes and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The sheet only exists below 1024 px.");
    await page.goto("/");
    const open = page.getByRole("button", { name: "Open menu" });
    await open.click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(open).toHaveAttribute("aria-expanded", "true");
    for (const name of ["Product", "Features", "How It Works", "Download", "FAQ"]) await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Get Briefnest" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Watch Demo" })).toBeVisible();

    // The page behind is inert while the sheet is open.
    expect(await page.evaluate(() => document.activeElement?.closest("dialog")?.id)).toBe("mobile-menu");

    await menu.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();

    await open.click();
    await menu.getByRole("link", { name: "Features", exact: true }).click();
    await expect(page).toHaveURL(/\/features$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Watch Demo" }).click();
    await expect(page.getByRole("dialog", { name: /The Briefnest film/ })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });

  test("the skip link is the first stop and lands on the content", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, "Keyboard-only path.");
    test.skip(browserName === "webkit", "Safari leaves links out of the Tab order unless the user turns that on.");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });
});

test.describe("home page interactions", () => {
  test("the workflow steps respond to clicks and arrow keys", async ({ page, isMobile }) => {
    await page.goto("/#how-it-works");
    if (isMobile) {
      // On a phone the five steps are simply listed in order.
      const steps = page.locator("#how-it-works ol > li h3");
      await expect(steps).toHaveText(["Capture", "Understand", "Decide", "Act", "Remember"]);
      return;
    }
    const tabs = page.getByRole("tablist", { name: "How Briefnest works" });
    await expect(tabs.getByRole("tab", { name: /Capture/ })).toHaveAttribute("aria-selected", "true");
    await tabs.getByRole("tab", { name: /Decide/ }).click();
    await expect(page.getByRole("tabpanel", { name: /Decide/ })).toContainText("Nothing joins the record until you approve it.");
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: /Act/ })).toBeFocused();
    await expect(page.getByRole("tabpanel", { name: /Act/ })).toBeVisible();
    await page.keyboard.press("End");
    await expect(tabs.getByRole("tab", { name: /Remember/ })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: /Capture/ })).toHaveAttribute("aria-selected", "true");
  });

  test("the scattered fragments connect, and the switch scatters them again", async ({ page }) => {
    await page.goto("/#product");
    const group = page.getByRole("group", { name: /scattered or connected/ });
    // The fragments connect when the scene itself scrolls into view.
    await page.getByText("Why three, not five").scrollIntoViewIfNeeded();
    await expect(group.getByRole("button", { name: "Connected" })).toHaveAttribute("aria-pressed", "true");
    await group.scrollIntoViewIfNeeded();
    await group.getByRole("button", { name: "Scattered" }).click();
    await expect(group.getByRole("button", { name: "Scattered" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("In a pull request", { exact: true })).toBeVisible();
  });

  test("before and after: the transcript turns into notes", async ({ page }) => {
    await page.goto("/#notes");
    const group = page.getByRole("group", { name: "Before and after" });
    await group.scrollIntoViewIfNeeded();
    await group.getByRole("button", { name: /Before/ }).click();
    await expect(page.getByText("What was said, as it was said.")).toBeVisible();
    await expect(page.getByRole("img", { name: /^Before: the raw Sprint Planning transcript/ })).toBeVisible();
    await group.getByRole("button", { name: /After/ }).click();
    await expect(page.getByText("A draft, waiting for your approval.")).toBeVisible();
  });

  test("the review sketch accepts, dismisses and resets", async ({ page }) => {
    await page.goto("/#actions");
    await page.getByRole("button", { name: "Mark Done" }).click();
    await expect(page.getByText("Marked done, and logged in its history.")).toBeVisible();
    await expect(page.locator("#actions").getByText("Done", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(page.getByText("Dismissed. The action stays open.")).toBeVisible();
  });

  test("decision versions switch with the timeline", async ({ page }) => {
    await page.goto("/#decisions");
    const tabs = page.getByRole("tablist", { name: "Versions of the decision" });
    await expect(tabs.getByRole("tab", { name: /Version 2/ })).toHaveAttribute("aria-selected", "true");
    await tabs.getByRole("tab", { name: /Version 1/ }).click();
    await expect(page.getByRole("img", { name: /^Version 1 of the decision/ })).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(tabs.getByRole("tab", { name: /Version 2/ })).toBeFocused();
    await expect(page.getByRole("img", { name: /^Version 2 of the decision/ })).toBeVisible();
  });

  test("an answer opens onto its sources, and a proposal can be applied", async ({ page }) => {
    await page.goto("/#ask");
    await page.getByRole("button", { name: /\[S2\]\s*show where this came from/ }).click();
    await expect(page.getByRole("region", { name: "Decision: Payment retry policy · v2" })).toContainText("Retry failed payments at most three times.");
    await page.getByRole("button", { name: "See it applied" }).click();
    await expect(page.getByRole("img", { name: "The same card after approval, marked Applied." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Show the proposal again" })).toBeVisible();
  });

  test("the product tour moves by tab, arrow key, button and swipe", async ({ page, isMobile }) => {
    await page.goto("/#tour");
    const tabs = page.getByRole("tablist", { name: "Product tour" });
    const panel = page.locator("#tour").getByRole("tabpanel");
    await expect(tabs.getByRole("tab")).toHaveCount(8);
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Workspace overview");

    await tabs.getByRole("tab", { name: "Decisions" }).click();
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Decisions");
    await expect(panel.getByRole("img", { name: /^The Decisions page/ })).toBeVisible();

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Chat");
    await page.getByRole("button", { name: "Previous page" }).click();
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Decisions");

    if (isMobile) {
      // A sideways swipe on the screenshot goes to the next page.
      const shot = panel.getByRole("img", { name: /^The Decisions page/ });
      const box = (await shot.boundingBox())!;
      const y = box.y + box.height / 2;
      await shot.dispatchEvent("pointerdown", { pointerType: "touch", clientX: box.x + box.width * 0.8, clientY: y, bubbles: true });
      await shot.dispatchEvent("pointerup", { pointerType: "touch", clientX: box.x + box.width * 0.2, clientY: y, bubbles: true });
      await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Chat");
    } else {
      await tabs.getByRole("tab", { name: "Decisions" }).focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.getByRole("tab", { name: "Chat" })).toBeFocused();
      await page.keyboard.press("End");
      await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Review");
      await page.keyboard.press("ArrowRight");
      await expect(panel.getByRole("heading", { level: 3 })).toHaveText("Workspace overview");
    }
  });

  test("questions open and close from the keyboard", async ({ page, isMobile }) => {
    await page.goto("/#faq");
    const question = page.locator("#offline summary");
    const answer = page.locator("#offline").getByText(/Your archive is stored on your Mac/);
    await expect(answer).toBeHidden();
    if (isMobile) {
      await question.click();
      await expect(answer).toBeVisible();
      return;
    }
    await question.focus();
    await page.keyboard.press("Enter");
    await expect(answer).toBeVisible();
    await page.keyboard.press("Space");
    await expect(answer).toBeHidden();
  });
});
