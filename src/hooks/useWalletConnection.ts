"use client";
import {useEffect,useSyncExternalStore} from "react";
import {initializeWallet,subscribeWallet,walletSnapshot,walletServerSnapshot} from "@/lib/wallet/client";
export function useWalletConnection(){const state=useSyncExternalStore(subscribeWallet,walletSnapshot,walletServerSnapshot);useEffect(()=>{void initializeWallet();},[]);return state;}
