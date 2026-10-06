import {access,body,failure,publicRate,response} from "@/lib/support/server";
import {verifyWalletChallenge} from "@/lib/wallet/session";
export const dynamic="force-dynamic";
export async function POST(request:Request){try{await access(request);await publicRate(request);return response(await verifyWalletChallenge(request,await body(request)));}catch(error){return failure(error);}}
