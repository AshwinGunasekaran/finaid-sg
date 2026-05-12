import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# List of schemes to scrape
# Add more schemes here as you grow the database
SCHEMES_TO_SCRAPE = [
    {
        "slug": "moe-higher-education-bursary",
        "url": "https://www.moe.gov.sg/financial-matters/financial-assistance",
        "notes": "MOE financial assistance page"
    },
    {
        "slug": "cpf-education-loan-scheme",
        "url": "https://www.cpf.gov.sg/member/infohub/educational-resources/applying-for-cpf-education-scheme",
        "notes": "CPF education loan info page"
    },
    {
        "slug": "comcare-short-medium-term",
        "url": "https://www.msf.gov.sg/comcare",
        "notes": "ComCare assistance page"
    },
]

async def scrape_scheme(page, scheme):
    print(f"Scraping: {scheme['slug']}...")
    
    try:
        await page.goto(scheme["url"], wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)  # Extra 3 seconds for JS to render
        content = await page.content()
        soup = BeautifulSoup(content, "html.parser")

        # Try to get main content
        main_content = (
            soup.find("main") or
            soup.find("div", class_="content") or
            soup.find("div", class_="main-content") or
            soup.find("article")
        )

        description = ""
        if main_content:
            paragraphs = main_content.find_all("p")
            description = " ".join([p.get_text(strip=True) for p in paragraphs[:3]])

        # Clean up whitespace
        description = " ".join(description.split())

        if not description or len(description) < 20:
            print(f"  ⚠️ Could not extract description for {scheme['slug']}, skipping update")
            status = "no_content"
        else:
            # Update scheme
            supabase.table("schemes").update({
                "description": description[:1000],
                "last_scraped": datetime.now().isoformat()
            }).eq("slug", scheme["slug"]).execute()
            print(f"  ✓ Updated {scheme['slug']}")
            status = "success"

        # Log it
        scheme_row = supabase.table("schemes").select("id").eq("slug", scheme["slug"]).single().execute()
        if scheme_row.data:
            supabase.table("scrape_logs").insert({
                "scheme_id": scheme_row.data["id"],
                "status": status,
                "notes": scheme["notes"]
            }).execute()

    except Exception as e:
        print(f"  ✗ Error scraping {scheme['slug']}: {e}")
        scheme_row = supabase.table("schemes").select("id").eq("slug", scheme["slug"]).single().execute()
        if scheme_row.data:
            supabase.table("scrape_logs").insert({
                "scheme_id": scheme_row.data["id"],
                "status": "error",
                "notes": str(e)
            }).execute()

async def scrape_all():
    print("=== Starting full scrape ===")
    print(f"Scraping {len(SCHEMES_TO_SCRAPE)} schemes...\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        for scheme in SCHEMES_TO_SCRAPE:
            await scrape_scheme(page, scheme)
            await asyncio.sleep(2)  # Be polite, wait between requests

        await browser.close()

    print("\n=== Scrape complete ===")

asyncio.run(scrape_all())