import { calculateBattle } from '../../core/battle.js';
// Read-only, current-build estimates using the very same combat calculator as
// dispatch. A fuel budget is a necessary condition, never a victory guarantee.
export function createVoyagePlanning(runtime) {
  const names={short:'短道',bypass:'绕道'};
  const edge=id=>runtime.spec.transitions.find(e=>e.id===id);
  function enemyEstimate(state,id) {
    const entity=runtime.entity(id),enemy=entity.enemy;
    return {id,title:entity.title,enemy:{...enemy},alreadyCleared:state.cleared.includes(id),battle:calculateBattle(state.stats,enemy),specialLabel:({magic:'魔法攻击：无视防御',firstStrike:'先制：额外反击一次',doubleHit:'二连击：每次反击两段物理伤害'}[enemy.special]??'普通物理反击；璃先攻')};
  }
  function allRoutes(state) {
    const enemies=[enemyEstimate(state,'c.machine1'),enemyEstimate(state,'c.machine2')],supply=runtime.entity('c.supplies'),initialFuel=runtime.spec.initial.resources.fuel,fixedSupply=supply.effects.resources.fuel;
    const routes=[];
    for(const route1 of ['short','bypass'])for(const route2 of ['short','bypass']){
      const fuelCost=edge('c.sail12').cost.fuel+edge(`c.sail23.${route1}`).cost.fuel+edge(`c.sail34.${route2}`).cost.fuel+edge('c.sail45').cost.fuel;
      const fights=[route1,route2].flatMap((route,i)=>route==='short'?[enemies[i]]:[]);
      routes.push({route1,route2,label:`一处${names[route1]} / 二处${names[route2]}`,fuelCost,availableFromStart:initialFuel+fixedSupply,finalFuelFromStart:initialFuel+fixedSupply-fuelCost,currentBuildFullDamage:fights.reduce((sum,e)=>sum+e.battle.totalDamage,0),remainingUnclearedDamage:fights.filter(e=>!e.alreadyCleared).reduce((sum,e)=>sum+e.battle.totalDamage,0),compatibleWithCommittedRoute:(!state.flags['c.route1']||state.flags['c.route1']===route1)&&(!state.flags['c.route2']||state.flags['c.route2']===route2)});
    }
    const bandage=runtime.entity('c.bandage');
    return {label:'当前构筑估算，不计未来购买或提升，不保证整条路线可行',stats:{...state.stats},enemies,routes,initialFuel,fixedSupply,supplyCollected:state.cleared.includes(supply.id),knownRecovery:{title:bandage.title,collected:state.cleared.includes(bandage.id),hp:bandage.effects.stats.hp,maxHp:bandage.effects.stats.maxHp},noRefundForPriorFights:true};
  }
  return Object.freeze({enemyEstimate,allRoutes});
}
