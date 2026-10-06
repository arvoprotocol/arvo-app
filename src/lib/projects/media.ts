export type ProjectVideoSource={kind:"youtube";id:string}|{kind:"file";url:string};
export function projectVideoSource(value:string):ProjectVideoSource|null {
 const text=value.trim();if(!text)return null;
 if(/^\/project-videos\/[a-zA-Z0-9_-]+\.(?:mp4|webm)$/.test(text))return {kind:"file",url:text};
 let url:URL;try{url=new URL(text);}catch{throw new Error("Use a YouTube link or a direct HTTPS MP4/WebM URL.");}
 if(url.protocol!=="https:"||url.username||url.password)throw new Error("Video links must use HTTPS without embedded credentials.");
 const host=url.hostname.toLowerCase();let id:string|null=null;
 if(host==="youtu.be")id=url.pathname.slice(1);
 else if(["youtube.com","www.youtube.com","m.youtube.com","www.youtube-nocookie.com"].includes(host)) {
  if(url.pathname==="/watch")id=url.searchParams.get("v");
  else {const match=/^\/(?:embed|shorts)\/([^/]+)\/?$/.exec(url.pathname);id=match?.[1]??null;}
 }
 if(id!==null){if(!/^[a-zA-Z0-9_-]{11}$/.test(id))throw new Error("Enter a valid YouTube video link.");return {kind:"youtube",id};}
 if(/\.(?:mp4|webm)$/i.test(url.pathname)&&!["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtube-nocookie.com"].includes(host))return {kind:"file",url:url.href};
 throw new Error("Use a YouTube video link or a direct MP4/WebM URL, rather than a video player page.");
}
export function galleryInput(value:unknown):string[] {
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>12)throw new Error("Use up to twelve additional gallery images.");
 const result:string[]=[];
 for(const path of value){if(typeof path!=="string"||!/^\/api\/project-images\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(path))throw new Error("Upload gallery images using the project editor.");if(result.includes(path))throw new Error("Gallery images must not be duplicated.");result.push(path);}
 return result;
}
