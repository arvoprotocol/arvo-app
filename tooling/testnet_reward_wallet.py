#!/usr/bin/env python3
"""Pinned Robinhood testnet mock-token top-up and optional reward operations."""
import argparse, re, subprocess
from decimal import Decimal
from pathlib import Path
CAST='/root/.foundry/bin/cast'
RPC='https://rpc.testnet.chain.robinhood.com'
PROXY='0x54697F1BE0E26d079CEb97992df54b8A700C6968'
ADMIN='0x8A382ca8B4536b924C5d1cb77A048f44396C1477'
KEYSTORE='/root/arvo-testnet-keystores/5c9a7d16-a1b9-4499-97d3-e064e303c6d1'
TOKENS=[('ARVO','0xD05e38a43FA819945a4082764562B91d6047b76c',18,100_000_000),('USDG','0xD6554EB0B9fBCb8d8f423Ad4Bf842D473bE6d6B2',6,10_000_000)]
def run(*args):
    result=subprocess.run([CAST,*map(str,args)],capture_output=True,text=True,timeout=45)
    if result.returncode:raise SystemExit(result.stderr.strip())
    return result.stdout.strip()
def query(*args):return run(*args,'--rpc-url',RPC)
def number(*args):return int(query(*args).split()[0])
def units(raw,decimals):
    if not re.fullmatch(r'\d+(?:\.\d+)?',raw):raise SystemExit('Invalid amount.')
    value=Decimal(raw)*10**decimals
    if value!=int(value):raise SystemExit('Too many decimal places.')
    return int(value)
def send(target,signature,*args):
    query('call',target,signature,*args,'--from',ADMIN)
    result=subprocess.run([CAST,'send',target,signature,*map(str,args),'--rpc-url',RPC,'--keystore',KEYSTORE,'--from',ADMIN])
    if result.returncode:raise SystemExit('Transaction failed; stopped. Earlier confirmed transactions remain applied.')
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply',action='store_true')
    parser.add_argument('--fund-arvo',default='0');parser.add_argument('--fund-usdc',default='0')
    parser.add_argument('--reserve-pool',type=int)
    parser.add_argument('--reserve-arvo',default='0');parser.add_argument('--reserve-usdc',default='0')
    args=parser.parse_args()
    if query('chain-id')!='46630':raise SystemExit('Wrong network; stopped.')
    if args.reserve_pool is not None and not 0<=args.reserve_pool<2**32:raise SystemExit('Invalid pool ID.')
    funding=[units(args.fund_arvo,18),units(args.fund_usdc,6)]
    allocation=[units(args.reserve_arvo,18),units(args.reserve_usdc,6)]
    if any(allocation) and args.reserve_pool is None:raise SystemExit('Specify --reserve-pool for allocation.')
    if args.apply and not Path(KEYSTORE).is_file():raise SystemExit('Expected encrypted keystore missing.')
    role=query('call',PROXY,'REWARD_MANAGER_ROLE()(bytes32)')
    if query('call',PROXY,'hasRole(bytes32,address)(bool)',role,ADMIN)!='true':raise SystemExit('Admin lacks reward role.')
    topups=[]
    for name,token,decimals,target in TOKENS:
        if query('call',PROXY,name.lower()+'()(address)').lower()!=token.lower():raise SystemExit('Unexpected staking token binding.')
        if number('call',token,'decimals()(uint8)')!=decimals:raise SystemExit('Unexpected token decimals.')
        balance=number('call',token,'balanceOf(address)(uint256)',ADMIN)
        topup=max(0,target*10**decimals-balance);topups.append(topup)
        if topup:query('call',token,'mint(address,uint256)',ADMIN,topup,'--from',ADMIN)
        print(f'{name}: admin balance {Decimal(balance)/10**decimals:,}; top-up {Decimal(topup)/10**decimals:,}')
    print('Admin:',ADMIN)
    print('Shared reserve funding:',args.fund_arvo,'ARVO /',args.fund_usdc,'USDG')
    if args.reserve_pool is not None:print('Pool allocation:',args.reserve_pool,args.reserve_arvo,'ARVO /',args.reserve_usdc,'USDG; contract must still allow allocation before opening.')
    if not args.apply:
        print('Read-only check complete. Add --apply to execute the displayed operations. Enter passwords only at cast prompts.');return
    for (name,token,decimals,target),topup,fund in zip(TOKENS,topups,funding):
        if topup:send(token,'mint(address,uint256)',ADMIN,topup)
        if fund:
            if number('call',token,'balanceOf(address)(uint256)',ADMIN)<fund:raise SystemExit('Insufficient funding balance.')
            allowance=number('call',token,'allowance(address,address)(uint256)',ADMIN,PROXY)
            if allowance<fund:
                if allowance:send(token,'approve(address,uint256)',PROXY,0)
                send(token,'approve(address,uint256)',PROXY,fund)
            send(PROXY,'fund'+('Arvo' if name=='ARVO' else 'Usdc')+'Rewards(uint256)',fund)
    if args.reserve_pool is not None and any(allocation):send(PROXY,'reservePoolRewardBudget(uint32,uint256,uint256)',args.reserve_pool,*allocation)
    print('Requested transactions completed. No pool was created or activated.')
if __name__=='__main__':main()
