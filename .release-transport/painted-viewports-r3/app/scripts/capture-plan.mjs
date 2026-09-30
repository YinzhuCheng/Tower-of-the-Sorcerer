/** 64 images per viewport / 128 total. All playfield evidence is marker OFF. */
export const CAPTURE_PLANS={
 forest:{anchors:['root','bay','upper'],fourFacings:['root'],routes:[{from:'root',to:'bay',stops:[0,.5,1]}]},
 harbor:{anchors:['door','bridge','west_entry','east_lower_stair','east-flight','underbridge','east-turn','east-top','east_foot'],fourFacings:['door','bridge','west_entry','east_lower_stair','east-flight'],routes:[
  {from:'east_foot',to:'east-top',stops:[0,.05,.1,.15,.2,.25,.3,.35,.4,.45,.5,.6,.675,.75,.825,.9,.95,1]},
  {from:'bridge',to:'underbridge',stops:[0,.25,.5,.75,1]},
  {from:'west_entry',to:'bridge',stops:[0,.05,.1,1]},
 ]},
};
export const plannedPerViewport=Object.values(CAPTURE_PLANS).reduce((n,p)=>n+1+p.anchors.length+p.fourFacings.length*3+p.routes.reduce((n,r)=>n+r.stops.length,0)+1,0);
export const plannedTotal=plannedPerViewport*2;
