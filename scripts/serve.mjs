import http from "node:http";
import {readFile,stat} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../dist/",import.meta.url));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".woff2":"font/woff2",".ttf":"font/ttf"};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);const file=path.resolve(root,"."+pathname+(pathname.endsWith("/")?"index.html":""));if(!file.startsWith(root)){res.writeHead(403);res.end();return;}const data=await readFile(file);res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream"});res.end(data);}catch{res.writeHead(404);res.end("Not found");}}).listen(Number(process.env.PORT || 4173),"0.0.0.0",()=>console.log("Phil Dental Clinic: http://localhost:4173"));
