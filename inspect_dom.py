import asyncio
from playwright.sync_api import sync_playwright

def inspect_page_headers():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to the Schedule page
        page.goto('http://localhost:1234/schedule')
        page.wait_for_load_state('networkidle')
        
        print("=== INSPECTING SCHEDULE PAGE ===\n")
        
        # Find the h1 element
        h1_element = page.query_selector('h1')
        if h1_element:
            h1_text = h1_element.text_content()
            print(f"H1 Text: {h1_text}")
            
            # Get all children of the h1's parent
            children_info = page.evaluate('''() => {
                const h1 = document.querySelector('h1');
                if (!h1 || !h1.parentElement) return [];
                
                return Array.from(h1.parentElement.children).map(child => ({
                    tagName: child.tagName,
                    className: child.className,
                    textContent: child.textContent?.substring(0, 100)
                }));
            }''')
            
            print("\n=== H1 PARENT'S CHILDREN ===")
            for i, child in enumerate(children_info):
                print(f"\nChild {i}:")
                print(f"  Tag: {child['tagName']}")
                print(f"  Class: {child['className']}")
                print(f"  Text: {child['textContent']}...")
        
        # Look for subtitle text
        subtitle_search = "Gerencie todos os agendamentos"
        elements_with_subtitle = page.query_selector_all(f'text="{subtitle_search}"')
        
        print(f"\n=== FOUND {len(elements_with_subtitle)} ELEMENTS WITH SUBTITLE TEXT ===")
        for i, element in enumerate(elements_with_subtitle):
            tag = element.evaluate('(el) => el.tagName')
            classes = element.evaluate('(el) => el.className')
            parent_tag = element.evaluate('(el) => el.parentElement.tagName')
            
            print(f"\nElement {i}:")
            print(f"  Tag: {tag}")
            print(f"  Classes: {classes}")
            print(f"  Parent Tag: {parent_tag}")
            
            # Get surrounding HTML
            surrounding = element.evaluate('''(el) => {
                const parent = el.parentElement;
                if (!parent) return '';
                return parent.innerHTML.substring(0, 300);
            }''')
            print(f"  Surrounding HTML: {surrounding}...")
        
        # Check for any p tags with text-muted-foreground right after h1
        suspicious_elements = page.evaluate('''() => {
            const results = [];
            const h1s = document.querySelectorAll('h1');
            
            h1s.forEach(h1 => {
                let next = h1.nextElementSibling;
                while (next && next.tagName !== 'H1' && next.tagName !== 'DIV') {
                    if (next.tagName === 'P' || next.className.includes('text-muted')) {
                        results.push({
                            h1Text: h1.textContent,
                            nextTag: next.tagName,
                            nextClass: next.className,
                            nextText: next.textContent?.substring(0, 100)
                        });
                    }
                    next = next.nextElementSibling;
                }
            });
            
            return results;
        }''')
        
        if suspicious_elements:
            print("\n=== SUSPICIOUS ELEMENTS AFTER H1 ===")
            for item in suspicious_elements:
                print(f"\nAfter H1 '{item['h1Text']}':")
                print(f"  Found: <{item['nextTag']} class='{item['nextClass']}'>{item['nextText']}</...>")
        
        browser.close()

if __name__ == "__main__":
    inspect_page_headers()