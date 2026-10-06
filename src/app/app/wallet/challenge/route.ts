import {access,body,failure,response} from "@/lib/support/server";
import {createWalletChallenge} from "@/lib/wallet/session";
export const dynamic="force-dynamic";
export async function POST(request:Request){try{await access(request);const value=await body(request);return response(await createWalletChallenge(request,value.address,value.chainId));}catch(error){return failure(error);}}
