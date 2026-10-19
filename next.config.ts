import type {NextConfig} from "next";
const nextConfig:NextConfig={
 poweredByHeader:false,
 async rewrites(){
  if(!process.env.NEXT_PUBLIC_APP_URL)return [];
  const host=new URL(process.env.NEXT_PUBLIC_APP_URL).hostname.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const has:[{type:"host";value:string}]=[{type:"host",value:host}];
  return {beforeFiles:[
   {source:"/",destination:"/app",has},
   {source:"/:section(stake|portfolio|projects|rewards|treasury|community|governance|activity|support|terms|admin|wallet|vault-previews|market-price|community-data|community-posts)/:path*",destination:"/app/:section/:path*",has}
  ],afterFiles:[],fallback:[]};
 },
 async headers(){return [{source:"/:path*",headers:[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Referrer-Policy",value:"same-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=()"},
  ...(process.env.NODE_ENV==="production"?[{key:"Strict-Transport-Security",value:"max-age=31536000; includeSubDomains"}]:[])
 ]},{source:"/app/:path*",headers:[{key:"Cache-Control",value:"private, no-store"}]},{source:"/api/admin/:path*",headers:[{key:"Cache-Control",value:"private, no-store"}]}];}
};
export default nextConfig;
