import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

async def scrape_moe_bursary():
    print("Starting MOE bursary scrape...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("https://www.moe.gov.sg/financial-matters/financial-assistance", 
                       wait_until="networkidle",
                       timeout=30000)
        
        content = await page.content()
        await browser.close()
    
    soup = BeautifulSoup(content, "html.parser")
    
    # Extract main content
    main_content = soup.find("main") or soup.find("div", class_="content")
    description = ""
    if main_content:
        paragraphs = main_content.find_all("p")
        description = " ".join([p.get_text(strip=True) for p in paragraphs[:3]])
    
    if not description:
        description = "A government-funded bursary that provides financial assistance to Singapore Citizens pursuing their first MOE-subsidised full-time undergraduate programme."

    # Update scheme in Supabase
    result = supabase.table("schemes").update({
        "description": description,
        "last_scraped": datetime.now().isoformat()
    }).eq("slug", "moe-higher-education-bursary").execute()

    # Log the scrape
    scheme = supabase.table("schemes").select("id").eq("slug", "moe-higher-education-bursary").single().execute()
    if scheme.data:
        supabase.table("scrape_logs").insert({
            "scheme_id": scheme.data["id"],
            "status": "success",
            "notes": "Scraped MOE financial assistance page"
        }).execute()

    print("MOE bursary scrape complete!")
    print(f"Description preview: {description[:100]}...")

asyncio.run(scrape_moe_bursary())