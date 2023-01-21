/*
* Website: https://www.xtrendence.com
* Portfolio: https://www.xtrendence.dev
* GitHub: https://www.github.com/Xtrendence
*/
export default class XNotify{constructor(t){this.position=this.empty(t)?"TopRight":t,this.defaults={width:"250px",borderRadius:"10px",duration:5e3,color:"rgb(255,255,255)",success:{title:"Success Notification",description:"Whatever you did, it worked.",background:"rgb(40,200,80)"},error:{title:"Error Notification",description:"That didn't work out, did it?",background:"rgb(230,50,50)"},alert:{title:"Alert Notification",description:"This is probably important...",background:"rgb(240,180,10)"},info:{title:"Info Notification",description:"Just so you know...",background:"rgb(170,80,220)"}}}setOptions(t,e){this.width=this.empty(t.width)?this.defaults.width:t.width,this.borderRadius=this.empty(t.borderRadius)?this.defaults.borderRadius:t.borderRadius,this.title=this.empty(t.title)?this.defaults[e].title:t.title,this.description=this.empty(t.description)?this.defaults[e].description:t.description,this.duration=this.empty(t.duration)?this.defaults.duration:t.duration,this.background=this.empty(t.background)?this.defaults[e].background:t.background,this.color=this.empty(t.color)?this.defaults.color:t.color}success(t){this.setOptions(t,"success");let e=this.createElement();this.showNotification(e)}error(t){this.setOptions(t,"error");let e=this.createElement();this.showNotification(e)}alert(t){this.setOptions(t,"alert");let e=this.createElement();this.showNotification(e)}info(t){this.setOptions(t,"info");let e=this.createElement();this.showNotification(e)}createElement(){if(!document.getElementById("x-notify-container")){let t=document.getElementsByTagName("body")[0],e="calc(100% - 20px)",i="20px",o="0",s="0",n="0",r="auto",a="auto";switch(this.position){case"BottomRight":e="auto",s="auto",r="0";break;case"BottomLeft":e="auto",i="0",o="20px",s="auto",n="auto",r="0",a="0";break;case"TopLeft":i="0",o="20px",n="auto",a="0";break}let l=document.createElement("div");l.id="x-notify-container",l.style="position:fixed; z-index:999; width:calc("+this.width+" + 70px); height:"+e+"; pointer-events:none; overflow-x:hidden; overflow-y:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; scroll-behavior:smooth; padding-top:20px; padding-right:"+i+"; padding-left:"+o+"; top:"+s+"; right:"+n+"; bottom:"+r+"; left:"+a+";",t.appendChild(l)}let t="TopRight"===this.position||"BottomRight"===this.position?"right":"left",e=document.createElement("div");e.id=this.generateID(),e.style="display:block; padding:0 0 20px 0; text-align:"+t+"; width:100%;";let i=document.createElement("div");return i.classList.add("x-notification"),i.style="background:"+this.background+"; color:"+this.color+"; width:"+this.width+"; border-radius:"+this.borderRadius+'; padding:10px 12px 12px 12px; font-family:"Helvetica Neue", "Lucida Grande", "Arial", "Verdana", "Tahoma", sans-serif; display:inline-block; text-align:left; opacity:0; pointer-events:auto; -webkit-user-select:none; -khtml-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; outline:none;',i.innerHTML='<span style="font-size:18px; font-weight:bold; color:'+this.color+'; display:block; line-height:25px;">'+this.title+'</span><span style="font-size:16px; color:'+this.color+'; display:block; margin-top:5px; line-height:25px;">'+this.description+"</span>",e.append(i),e}showNotification(t){let e=document.getElementById("x-notify-container"),i=t.getElementsByClassName("x-notification")[0];"BottomRight"===this.position||"BottomLeft"===this.position?(e.append(t),e.scrollHeight>window.innerHeight&&(e.style.height="calc(100% - 20px)"),e.scrollTo(0,e.scrollHeight)):e.prepend(t);let o=.05,s=setInterval((()=>{o+=.05,i.style.opacity=o,o>=1&&(i.style.opacity=1,clearInterval(s))}),10);setTimeout((()=>{this.hideNotification(t)}),this.duration)}hideNotification(t){let e=document.getElementById("x-notify-container"),i=t.getElementsByClassName("x-notification")[0],o=1,s=setInterval((()=>{o-=.05,i.style.opacity=o,o<=0&&(t.remove(),clearInterval(s))}),10);e.scrollHeight<=window.innerHeight&&(e.style.height="auto"),this.empty(e.innerHTML)&&e.remove()}clear(){let t=document.getElementById("x-notify-container").getElementsByClassName("x-notification");for(let e=0;e<t.length;e++)this.hideNotification(t[e])}generateID(){let t=this.epoch()+"-"+this.shuffle(this.epoch());if(this.empty(document.getElementById("x-notify-container").innerHTML))return t;let e=!0;for(;e;){if(!document.getElementById(t)){e=!1;break}t=this.epoch()+"-"+this.shuffle(this.epoch())}return t}shuffle(t){let e=t.toString().split("");for(let t=e.length;t>0;){let i=parseInt(Math.random()*t),o=e[--t];e[t]=e[i],e[i]=o}return e.join("")}epoch(){var t=new Date;return Math.round(t.getTime()/1e3)}empty(t){return null==t||""===t.toString().trim()}}