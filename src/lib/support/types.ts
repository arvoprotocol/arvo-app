export const categories=["Staking","Wallet connection","Rewards","Projects","Other"] as const;
export const statuses=["open","answered","closed"] as const;
export type SupportView={id:string;subject:string;category:string;status:string;revision:number;createdAt:string;updatedAt:string;messageCount:number;unread:boolean;messages:{id:number;author:string;body:string;createdAt:string}[]};
export type SupportAdminView=SupportView&{name:string;email:string|null;wallet:string|null};
