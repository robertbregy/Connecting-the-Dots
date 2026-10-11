#!/usr/bin/env node
"use strict";
/* Build a single-file offline prototype. No network and no production writes. */
const fs=require("node:fs");
const path=require("node:path");
const root=__dirname;
const read=(file)=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html"),css=read("styles.css"),js=read("app.js");
const cssTag='<link rel="stylesheet" href="styles.css">';
const jsTag='<script src="app.js" defer></script>';
if(!html.includes(cssTag)||!html.includes(jsTag)||js.includes("</script>"))
  throw new Error("Unsafe or incompatible input for standalone integration.");
const generated=html.replace(cssTag,"<style>\n"+css+"\n</style>")
                    .replace(jsTag,"<script>\n"+js+"\n</script>");
const output=path.join(root,"standalone.html");
if(process.argv.includes("--check")){
  if(!fs.existsSync(output)||fs.readFileSync(output,"utf8")!==generated){
    console.error("OUTDATED_STANDALONE: regenerate with node prototype/ia-v1/build-standalone.cjs");
    process.exit(1);
  }
  console.log("IA_STANDALONE_MATCH",Buffer.byteLength(generated,"utf8"));
}else{
  fs.writeFileSync(output,generated,"utf8");
  console.log("IA_STANDALONE_WRITTEN",output,Buffer.byteLength(generated,"utf8"));
}
