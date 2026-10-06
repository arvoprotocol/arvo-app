import {access,failure,response} from "@/lib/support/server";
import {clearWalletSession,getWalletSession} from "@/lib/wallet/session";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{await access(request,false,false);return response({session:await getWalletSession()});}catch(error){return failure(error);}}
export async function DELETE(request:Request){try{await access(request);await clearWalletSession();return response({signedOut:true});}catch(error){return failure(error);}}
