import type {PrismaClient} from "@prisma/client";
export function supportMailSettings(env?:NodeJS.ProcessEnv):{recipient:string;from:{name:string;address:string};transport:object};
export function drainSupportMail(db:PrismaClient,options?:{limit?:number;transport?:{sendMail(value:unknown):Promise<unknown>};env?:NodeJS.ProcessEnv;now?:()=>Date}):Promise<{sent:number;failed:number}>;
