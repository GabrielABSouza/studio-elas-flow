/**
 * Test Suite: Page Headers Subtitle Removal Verification
 * 
 * Ensures that page headers do not render subtitle/description text
 * after the main H1 title element.
 */

import { render } from "@testing-library/react";
import { PageHeader } from "@/components/ui/page-header";

describe("PageHeader Subtitle Removal", () => {
  it("should render title without subtitle", () => {
    const { container } = render(
      <PageHeader 
        title="Test Title" 
        description="This subtitle should not appear"
      />
    );
    
    // Should have H1
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe("Test Title");
    
    // Should NOT have subtitle paragraph
    const subtitle = container.querySelector("p.text-muted-foreground");
    expect(subtitle).toBeNull();
    
    // Should NOT have any paragraph directly after H1
    const h1Parent = h1?.parentElement;
    const nextSibling = h1?.nextElementSibling;
    expect(nextSibling).toBeNull();
  });

  it("should render with children (buttons) but no subtitle", () => {
    const { container } = render(
      <PageHeader 
        title="Page with Button" 
        description="Hidden subtitle"
      >
        <button>Action Button</button>
      </PageHeader>
    );
    
    // Should have title
    expect(container.querySelector("h1")?.textContent).toBe("Page with Button");
    
    // Should have button
    expect(container.querySelector("button")).toBeInTheDocument();
    
    // Should NOT have subtitle
    expect(container.querySelector("p.text-muted-foreground")).toBeNull();
  });

  it("should maintain proper structure without space-y-1", () => {
    const { container } = render(
      <PageHeader title="Structure Test" description="Hidden" />
    );
    
    const titleContainer = container.querySelector("h1")?.parentElement;
    
    // Should not have space-y-1 class (which would add spacing for subtitle)
    expect(titleContainer?.className).not.toContain("space-y-1");
    
    // Should only contain the H1
    expect(titleContainer?.children).toHaveLength(1);
    expect(titleContainer?.children[0]?.tagName).toBe("H1");
  });
});

/**
 * Visual Regression Prevention
 * 
 * This test ensures that the specific pattern of:
 * <h1>Title</h1>
 * <p class="text-muted-foreground">Subtitle</p>
 * 
 * Is completely eliminated from page headers.
 */
describe("Page Header Visual Regression Prevention", () => {
  it("prevents h1 + p.text-muted-foreground pattern", () => {
    const { container } = render(
      <PageHeader 
        title="Gerenciamento de Clientes"
        description="Gerencie todas as informações das suas clientes em um só lugar"
      />
    );
    
    const h1 = container.querySelector("h1");
    expect(h1?.textContent).toBe("Gerenciamento de Clientes");
    
    // Critical: No muted text paragraph should exist anywhere
    const mutedTexts = container.querySelectorAll("p.text-muted-foreground");
    expect(mutedTexts).toHaveLength(0);
    
    // Critical: H1 should not be followed by any paragraph
    const h1NextSibling = h1?.nextElementSibling;
    expect(h1NextSibling?.tagName).not.toBe("P");
  });
});