"use strict";
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const PORT = 31843;
const BASE = "http://127.0.0.1:" + PORT;
const OUT = path.join(process.cwd(), "artifacts", "verius-visual");
fs.mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ["server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "test", ACCOUNT_DATA_FILE: "/tmp/verius-design-smoke-" + process.pid + ".json" },
  stdio: ["ignore", "pipe", "pipe"]
});
let log = "";
server.stdout.on("data", x => { log += x.toString(); });
server.stderr.on("data", x => { log += x.toString(); });

async function serverReady() {
  for (let i=0;i<65;i++) {
    if(server.exitCode!==null) throw Error("Server exited " + server.exitCode + ": " + log.slice(-2500));
    try { const r=await fetch(BASE+"/"); if(r.status<500) return; } catch {}
    await new Promise(r=>setTimeout(r,500));
  }
  throw Error("Server did not start: " + log.slice(-2500));
}
async function run(){
  await serverReady();
  const browser=await chromium.launch({headless:true});
  const report=[];
  try {
    for(const [name,width,height,isMobile] of [
      ["desktop",1440,900,false],["tablet",768,1024,true],["mobile",390,844,true],["small-mobile",360,740,true]
    ]){
      const page=await browser.newPage({viewport:{width,height},isMobile,hasTouch:isMobile});
      for(const route of ["/","/fuqarolar","/advokat-pro","/ai","/login"]){
        const response=await page.goto(BASE+route+"?lang=uz",{waitUntil:"domcontentloaded",timeout:30000});
        assert.ok(response && response.status()<500, name+" "+route+" server error "+(response&&response.status()));
        await page.screenshot({path:path.join(OUT,name+"-"+route.replaceAll("/","_").replace(/^_$/,"home")+".png"),fullPage:false});
        const h=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
        const overflow=h.scrollWidth-h.clientWidth;
        report.push({name,route,status:response.status(),overflow});
        // Pages must not overflow the viewport by more than an incidental 8px.
        assert.ok(overflow<=8, name+" "+route+" horizontal overflow "+overflow+"px");
      }
      // Root and Fuqarolar portal intentionally use a separate standalone citizen-home shell.
      // Verify shared VERIUS navigation on the AI service page instead.
      await page.goto(BASE+"/ai?lang=uz",{waitUntil:"domcontentloaded"});
      if(width>1150){
        assert.ok(await page.locator(".veriusServiceMenu summary").isVisible(),"Desktop services menu missing");
        await page.locator(".veriusServiceMenu summary").click();
        assert.ok(await page.locator(".veriusServicePanel a[href^='/court']").isVisible(),"Court tools not discoverable");
      } else {
        const menu=page.locator(".huquqiyMainNav .mobileMenu");
        assert.ok(await menu.isVisible(),"Mobile menu button missing");
        await menu.click();
        assert.equal(await menu.getAttribute("aria-expanded"),"true");
        assert.ok(await page.locator("#mobileNav .veriusMobileServices summary").isVisible());
        await page.locator("#mobileNav .veriusMobileServices summary").click();
        assert.ok(await page.locator("#mobileNav a[href^='/court']").isVisible());
        await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"),"false");
      }
      await page.close();
    }
    fs.writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2));
    console.log("PASS: visual smoke cases="+report.length);
    console.log(JSON.stringify(report));
  }finally { await browser.close(); }
}
run().catch(e=>{console.error("FAIL:",e.stack||e); console.error(log.slice(-3000));process.exitCode=1;}).finally(()=>{server.kill("SIGTERM");});
