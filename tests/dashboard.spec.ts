import { test, expect } from "@playwright/test";
async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill("admin");
  await page.getByLabel("Password", { exact: true }).fill("admin@1234");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/overview/);
}
test("login validation, visibility, Enter, same-tab session, route gate and logout", async ({
  page,
}) => {
  await page.goto("/customers/profile/?id=cust_001");
  await expect(page).toHaveTitle("Demo · Customer Dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome to Demo" }),
  ).toBeVisible();
  await expect(
    page.getByText(/sign up|create account|forgot password/i),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByText("Please enter your Username and password."),
  ).toBeVisible();
  await page.getByLabel("Username", { exact: true }).fill("admin");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(
    page.getByText(/Username or password is incorrect/),
  ).toBeVisible();
  await page.getByLabel("Username", { exact: true }).fill("not-admin");
  await page.getByLabel("Password", { exact: true }).fill("admin@1234");
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.getByText(/Username or password is incorrect/)).toBeVisible();
  expect(await page.evaluate(() => ({ ...sessionStorage }))).toEqual({});
  await page.getByLabel("Username", { exact: true }).fill("admin");
  await page.getByLabel("Password", { exact: true }).fill("Admin@1234");
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page.getByText(/Username or password is incorrect/)).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("admin@1234");
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect(page).toHaveURL(/overview/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A little more clarity." }),
  ).toBeVisible();
  expect(await page.evaluate(() => ({ ...sessionStorage }))).toEqual({
    "demo-dashboard-session": "true",
  });
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to Demo" }),
  ).toBeVisible();
  await page.goto("/platforms/shopify/");
  await expect(
    page.getByRole("heading", { name: "Welcome to Demo" }),
  ).toBeVisible();
});
test("keyboard global search, empty state, clear and profile refresh", async ({
  page,
}) => {
  await login(page);
  await page
    .getByRole("button", { name: "Search Customer Profile", exact: true })
    .click();
  await page.getByRole("combobox").fill("nobody is here");
  await expect(page.getByText("No customers found")).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.getByRole("combobox").fill("+44 (7700) 900001");
  await page.getByRole("combobox").press("ArrowDown");
  await page.getByRole("combobox").press("Enter");
  await expect(page).toHaveURL(/id=cust_001/);
  await expect(page.getByRole("heading", { name: "Emily Hart" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Emily Hart" })).toBeVisible();
  const external = page.locator(".open-platforms a");
  await expect(external).toHaveCount(5);
  for (const link of await external.all()) {
    expect(await link.getAttribute("target")).toBe("_blank");
    expect(await link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(await link.getAttribute("href")).not.toMatch(/cust_|example|\?/);
  }
  await page
    .getByRole("button", { name: "Search Customer Profile", exact: true })
    .click();
  await page.getByRole("combobox").press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("directory search, source filter, sorting and pagination", async ({
  page,
}) => {
  await login(page);
  await page
    .getByRole("link", { name: "Customers", exact: true })
    .first()
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  const first = await page.locator("tbody tr").first().innerText();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  expect(await page.locator("tbody tr").first().innerText()).not.toBe(first);
  await page.getByRole("button", { name: "Customer", exact: true }).click();
  await expect(page.locator("th").first()).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await page
    .getByRole("textbox", { name: "Search customers", exact: true })
    .fill("Emily");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear table search" }).click();
  await page.getByLabel("Customer source platform").selectOption("Klaviyo");
  await expect(page.locator(".table-footer")).toContainText("16 customers");
});
test("all profile tabs, complete history filter, detail drawer and sparse empty state", async ({
  page,
}) => {
  await login(page);
  await page.goto("/customers/profile/?id=cust_001");
  for (const name of [
    "Complete history",
    "Purchases",
    "Appointments",
    "Payments",
    "Communications",
    "Overview",
  ]) {
    await page.getByRole("tab", { name, exact: name !== "Purchases" }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  }
  await page.getByRole("tab", { name: "Complete history" }).click();
  await page.getByLabel("History platform").selectOption("Klaviyo");
  await expect(page.locator(".activity-item").first()).toContainText("Klaviyo");
  await page.getByLabel("Event type").selectOption("Refund");
  await expect(page.getByText("No activity to display")).toBeVisible();
  await page.getByRole("tab", { name: "Purchases" }).click();
  await page.locator("tbody .record-link").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Items purchased" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/customers/profile/?id=cust_021");
  await page.getByRole("tab", { name: "Purchases" }).click();
  await expect(page.getByText("Nothing to show yet")).toBeVisible();
  await page.goto("/customers/profile/?id=missing");
  await expect(page.getByText("Customer not found")).toBeVisible();
});
test("all platform pages and global search on every page, date controls and agenda navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const external: string[] = [];
  page.on("request", (r) => {
    if (!new URL(r.url()).hostname.match(/^(localhost|127.0.0.1)$/))
      external.push(r.url());
  });
  await login(page);
  const initial = await page
    .locator(".stats-grid .stat-card")
    .nth(1)
    .innerText();
  await page.getByLabel("Overview date range").selectOption("7");
  expect(
    await page.locator(".stats-grid .stat-card").nth(1).innerText(),
  ).not.toBe(initial);
  for (const name of ["Shopify", "Klaviyo", "TidyCal", "SumUp", "Atoa"]) {
    await page
      .getByRole("navigation")
      .getByRole("link", { name, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page.locator(".header-search").click();
    await page.getByRole("combobox").fill("cust_002");
    await expect(page.getByRole("option")).toContainText("Oliver Bennett");
    await page.getByRole("combobox").press("Escape");
  }
  await page.goto("/platforms/tidycal/");
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "September 2026" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(
    page.getByRole("heading", { name: "October 2026" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByText("A little breathing room")).toBeVisible();
  await page.getByRole("button", { name: "Demo month" }).click();
  await page.getByRole("textbox", { name: "Search agenda" }).fill("no match");
  await expect(page.getByText("A little breathing room")).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test("provider filters, payments, campaign preview and draft metrics", async ({
  page,
}) => {
  await login(page);
  for (const provider of ["sumup", "atoa"]) {
    await page.goto(`/platforms/${provider}/`);
    await page.getByLabel("Payment statuses").selectOption("Refunded");
    await expect(page.locator("tbody")).toContainText("Refunded");
    await page.locator("tbody .record-link").first().click();
    await expect(page.getByRole("dialog")).toContainText("Refund reference");
    await page.getByRole("button", { name: "Close dialog" }).click();
  }
  await page.goto("/platforms/klaviyo/");
  await page.getByLabel("Campaign status").selectOption("Draft");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("October");
  const cells = await page.locator("tbody td").allTextContents();
  expect(cells.slice(2, 6)).toEqual(["0", "0", "0", "0"]);
  await page.locator("tbody .record-link").click();
  await expect(page.getByText("READ-ONLY MESSAGE PREVIEW")).toBeVisible();
});
test("390px mobile layouts have no page overflow and drawer navigation works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  for (const path of [
    "/overview/",
    "/customers/",
    "/customers/profile/?id=cust_001",
    "/platforms/shopify/",
    "/platforms/tidycal/",
    "/platforms/klaviyo/",
    "/platforms/atoa/",
  ]) {
    await page.goto(path);
    await expect(page.locator(".page-content")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/customers/profile/?id=cust_001");
  await page.screenshot({
    path: "test-results/profile-mobile.png",
    fullPage: true,
  });
  expect(
    await page
      .locator(".profile-aside .card")
      .first()
      .evaluate((el) => el.getBoundingClientRect().width),
  ).toBeGreaterThan(350);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("button", { name: "Search Customer Profile", exact: true })
    .click();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.getByRole("combobox").press("Escape");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "SumUp", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "SumUp", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
