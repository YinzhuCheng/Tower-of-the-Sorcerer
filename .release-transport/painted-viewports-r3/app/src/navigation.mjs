/** The only navigation activation point. Missing/unreviewed adapters fail closed into QA anchors. */
export async function loadReviewedNavigation(sceneId){
 try{
  const response=await fetch(`data/${sceneId}-navigation-review.json`,{cache:'no-store'});
  if(!response.ok)return {enabled:false,reason:'定位审阅 · 导航未启用'};
  const review=await response.json();
  if(review.status!=='approved-local-movement')return {enabled:false,reason:review.reason??'导航待独立评审',review};
  const {createNavigation}=await import(`../adapters/${sceneId}.mjs`);
  const bundle=await createNavigation();
  if(!bundle.nav||!bundle.project||!bundle.resolveTarget||!bundle.anchors)throw Error('INCOMPLETE_ADAPTER');
  return {enabled:true,...bundle,review};
 }catch(error){return {enabled:false,reason:'定位审阅 · 导航接线未通过',error:String(error)};}
}
