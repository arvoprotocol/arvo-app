"use client";
import {useEffect,useState} from "react";
export function usePoolMetadata(refreshKey=0){
 const [titles,setTitles]=useState<Record<number,string>>({}),[orders,setOrders]=useState<Record<number,number>>({}),[ready,setReady]=useState(false);
 useEffect(()=>{const controller=new AbortController();
 fetch("/app/vault-previews",{cache:"no-store",signal:controller.signal}).then(async response=>{
  if(!response.ok){if(!controller.signal.aborted)setReady(true);return;}const data=await response.json();const next:Record<number,string>={},nextOrders:Record<number,number>={};
  for(const row of data.poolTitles??[])if(Number.isInteger(row.poolId)&&row.poolId>=0&&typeof row.title==="string"){next[row.poolId]=row.title;nextOrders[row.poolId]=Number.isInteger(row.sortOrder)?row.sortOrder:0;}
  if(!controller.signal.aborted){setTitles(next);setOrders(nextOrders);setReady(true);}
 }).catch(()=>{if(!controller.signal.aborted)setReady(true);});return()=>controller.abort();},[refreshKey]);return {titles,orders,ready};
}

export function usePoolTitles(refreshKey=0){return usePoolMetadata(refreshKey).titles;}
