import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto(
            "https://www.cpf.gov.sg/member/tools-and-services/forms-e-applications/apply-for-cpf-education-loan",
            wait_until="networkidle",
            timeout=30000
        )
        
        content = await page.content()
        await browser.close()
    
    soup = BeautifulSoup(content, "html.parser")
    
    # Print all paragraph text we can find
    paragraphs = soup.find_all("p")
    print(f"Found {len(paragraphs)} paragraphs")
    for i, p in enumerate(paragraphs[:10]):
        text = p.get_text(strip=True)
        if text:
            print(f"  [{i}] {text[:100]}")

asyncio.run(debug())