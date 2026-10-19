(()=>{
  'use strict';
  const lang=document.documentElement.lang;
  const labels={
    en:{months:['January','February','March','April','May','June','July','August','September','October','November','December'],days:['M','T','W','T','F','S','S'],selected:'Preferred date selected',pending:'Pending enquiry',loading:'Checking Google Calendar availability...',calendarError:'Availability could not be loaded. Please try again later.',confirmed:'Confirmed booking',sending:'Sending enquiry...',sent:'Your enquiry has been sent to LEILA. The date is not confirmed until the captain accepts and you complete payment.',failed:'The enquiry could not be sent. Check your connection and try again.',notConfigured:'Online enquiries are not available yet. Please email leilaexperiencereservas@gmail.com.'},
    es:{months:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],days:['L','M','X','J','V','S','D'],selected:'Fecha preferida seleccionada',pending:'Consulta pendiente',loading:'Consultando la disponibilidad del calendario de Google...',calendarError:'No se pudo consultar la disponibilidad. Int\u00e9ntalo de nuevo m\u00e1s tarde.',confirmed:'Reserva confirmada',sending:'Enviando consulta...',sent:'Tu solicitud se ha enviado a LEILA. La fecha no est\u00e1 confirmada hasta que el capit\u00e1n la acepte y completes el pago.',failed:'No se pudo enviar la solicitud. Comprueba la conexi\u00f3n e int\u00e9ntalo de nuevo.',notConfigured:'El formulario de consultas online todav\u00eda no est\u00e1 configurado. Escribe a leilaexperiencereservas@gmail.com.'},
    de:{months:['Januar','Februar','M\u00e4rz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],days:['M','D','M','D','F','S','S'],selected:'Wunschtermin ausgew\u00e4hlt',pending:'Offene Anfrage',loading:'Google-Kalender wird gepr\u00fcft...',calendarError:'Die Verf\u00fcgbarkeit konnte nicht geladen werden. Bitte sp\u00e4ter erneut versuchen.',confirmed:'Buchung best\u00e4tigt',sending:'Anfrage wird gesendet...',sent:'Deine Anfrage wurde an LEILA gesendet. Der Termin ist erst best\u00e4tigt, wenn der Kapit\u00e4n sie annimmt und du die Zahlung abgeschlossen hast.',failed:'Die Anfrage konnte nicht gesendet werden. Bitte pr\u00fcfe deine Verbindung und versuche es erneut.',notConfigured:'Online-Anfragen sind noch nicht verf\u00fcgbar. Bitte schreibe an leilaexperiencereservas@gmail.com.'}
  }[lang]||{months:['January','February','March','April','May','June','July','August','September','October','November','December'],days:['M','T','W','T','F','S','S'],selected:'Preferred date selected',pending:'Pending enquiry',loading:'Checking Google Calendar availability...',calendarError:'Availability could not be loaded. Please try again later.',confirmed:'Confirmed booking',sending:'Sending enquiry...',sent:'Your enquiry has been sent to LEILA. The date is not confirmed until the captain accepts and you complete payment.',failed:'The enquiry could not be sent. Check your connection and try again.',notConfigured:'Online enquiries are not available yet. Please email leilaexperiencereservas@gmail.com.'};
  const dateInput=document.querySelector('#date'),title=document.querySelector('#cal-title'),grid=document.querySelector('#cal-days'),picked=document.querySelector('#picked'),prev=document.querySelector('#prev'),next=document.querySelector('#next');
  const typeInput=document.querySelector('#type'),priceOutput=document.querySelector('#charter-price');
  const updateCharterPrice=()=>{
    if(!typeInput||!priceOutput)return;
    const type=typeInput.value.toLowerCase(),locale=lang==='es'?'es-ES':lang==='de'?'de-DE':'en-GB';
    const money=value=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
    let amount=null,description='';
    if(type.includes('day charter')||type.includes('tagescharter'))amount=1000;
    else if(type.includes('sunset')||type.includes('puesta')||type.includes('abendt'))amount=800;
    else if(type.includes('multi-day')||type.includes('varios d')||type.includes('mehrt')){
      const range=String(dateInput?.value||'').match(/^(\d{4}-\d{2}-\d{2})(?:\s*(?:\/|to|al|–|—)\s*(\d{4}-\d{2}-\d{2}))?$/i);
      if(range&&range[2]){
        const days=Math.round((Date.parse(range[2]+'T00:00:00Z')-Date.parse(range[1]+'T00:00:00Z'))/86400000)+1;
        if(days>0){amount=800*days;description=`800 € × ${days} ${lang==='es'?(days===1?'día':'días'):lang==='de'?(days===1?'Tag':'Tage'):(days===1?'day':'days')} = ${money(amount)}`}
      }
      if(amount===null)description=lang==='es'?'800 €/día · total según los días indicados':lang==='de'?'800 €/Tag · Gesamtpreis je nach angegebenen Tagen':'€800/day · total depends on the dates entered';
    }
    else if(type.includes('weekly')||type.includes('semanal')||type.includes('wochen'))amount=2000;
    else if(type.includes('tailored')||type.includes('itinerario')||type.includes('individuell'))amount=500;
    else if(type.includes('special')||type.includes('celebración')||type.includes('besonder'))amount=500;
    if(amount!==null&&!description)description=money(amount);
    priceOutput.hidden=!type;
    if(type)priceOutput.textContent=(lang==='es'?'Precio temporal: ':lang==='de'?'Temporärer Preis: ':'Temporary price: ')+description;
  };
  typeInput?.addEventListener('change',updateCharterPrice);
  dateInput?.addEventListener('input',updateCharterPrice);
  dateInput?.addEventListener('change',updateCharterPrice);
  updateCharterPrice();
  if(grid){
    let cursor=new Date();cursor.setDate(1);
    let chosen=null,availability=null,loading=true,loadVersion=0;
    const cache=new Map();
    const locale=lang==='es'?'es-ES':lang==='de'?'de-DE':'en-GB';
    const iso=(year,month,day)=>year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    const monthKey=()=>iso(cursor.getFullYear(),cursor.getMonth(),1).slice(0,7);
    const draw=()=>{
      title.textContent=labels.months[cursor.getMonth()]+' '+cursor.getFullYear();
      grid.replaceChildren();
      labels.days.forEach(day=>{const el=document.createElement('span');el.textContent=day;el.setAttribute('aria-hidden','true');grid.append(el)});
      const offset=(cursor.getDay()+6)%7;
      for(let i=0;i<offset;i++){const spacer=document.createElement('button');spacer.disabled=true;spacer.tabIndex=-1;spacer.setAttribute('aria-hidden','true');grid.append(spacer)}
      const count=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
      for(let day=1;day<=count;day++){
        const dayKey=iso(cursor.getFullYear(),cursor.getMonth(),day),isConfirmed=availability?.confirmed.has(dayKey)===true,isPending=availability?.pending.has(dayKey)===true&&!isConfirmed;
        const button=document.createElement('button');button.type='button';button.textContent=day;
        button.disabled=loading||availability===null||isConfirmed;
        button.setAttribute('aria-label',new Date(cursor.getFullYear(),cursor.getMonth(),day).toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'})+' \u2014 '+(isConfirmed?labels.confirmed:isPending?labels.pending:lang==='es'?'consulta, no confirmado':lang==='de'?'unverbindliche Anfrage':'request only, not confirmed'));
        if(isConfirmed)button.classList.add('confirmed-date');else if(isPending)button.classList.add('pending-date');
        if(chosen&&chosen.getFullYear()===cursor.getFullYear()&&chosen.getMonth()===cursor.getMonth()&&chosen.getDate()===day)button.classList.add('selected');
        if(!button.disabled)button.addEventListener('click',()=>{chosen=new Date(cursor.getFullYear(),cursor.getMonth(),day);dateInput.value=dayKey;updateCharterPrice();picked.textContent=labels.selected+': '+chosen.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'});draw()});
        grid.append(button);
      }
    };
    const loadAvailability=async()=>{
      const key=monthKey(),version=++loadVersion;
      if(cache.has(key)){const cached=cache.get(key);availability={pending:new Set(cached.pending),confirmed:new Set(cached.confirmed)};loading=false;if(!chosen)picked.textContent='';draw();return}
      availability=null;loading=true;picked.textContent=labels.loading;draw();
      try{
        const apiBase=window.LEILA_API_BASE;if(!apiBase)throw new Error(labels.notConfigured);
        const from=iso(cursor.getFullYear(),cursor.getMonth(),1),to=iso(cursor.getFullYear(),cursor.getMonth(),new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate());
        const url=apiBase.replace(/\/$/,'')+'/calendar-availability?from='+from+'&to='+to;
        const response=await fetch(url),dates=await response.json();
        if(!response.ok||!Array.isArray(dates.pending)||!Array.isArray(dates.confirmed))throw new Error(labels.calendarError);
        if(version!==loadVersion)return;
        cache.set(key,dates);availability={pending:new Set(dates.pending),confirmed:new Set(dates.confirmed)};loading=false;if(!chosen)picked.textContent='';draw();
      }catch(error){if(version!==loadVersion)return;availability=null;loading=false;picked.textContent=error.message===labels.notConfigured?error.message:labels.calendarError;draw()}
    };
    prev.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()-1);void loadAvailability()});
    next.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()+1);void loadAvailability()});
    void loadAvailability();
    const form=document.querySelector('#request-form'),status=document.querySelector('#request-status');
    form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form).entries());data.guests=Number(data.guests);status.hidden=false;status.textContent=labels.sending;const submit=form.querySelector('[type="submit"]');submit.disabled=true;try{const apiBase=window.LEILA_API_BASE;if(!apiBase)throw new Error(labels.notConfigured);const response=await fetch(apiBase.replace(/\/$/,'')+'/request-booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error?.message||labels.failed);status.textContent=labels.sent}catch(error){status.textContent=error.message||labels.failed}finally{submit.disabled=false}})
  }
})();
;
(()=>{const nav=document.querySelector('.nav'),links=document.querySelector('.navlinks');if(!nav||!links)return;const b=document.createElement('button');b.type='button';b.className='menu-toggle';b.textContent='\u2630';b.setAttribute('aria-label',document.documentElement.lang==='es'?'Abrir men\u00fa':document.documentElement.lang==='de'?'Men\u00fc \u00f6ffnen':'Open menu');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','primary-links');links.id='primary-links';nav.insertBefore(b,links);const close=()=>{links.classList.remove('menu-open');b.setAttribute('aria-expanded','false')};b.addEventListener('click',()=>{const open=links.classList.toggle('menu-open');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?(document.documentElement.lang==='es'?'Cerrar men\u00fa':document.documentElement.lang==='de'?'Men\u00fc schlie\u00dfen':'Close menu'):(document.documentElement.lang==='es'?'Abrir men\u00fa':document.documentElement.lang==='de'?'Men\u00fc \u00f6ffnen':'Open menu'))});links.addEventListener('click',e=>{if(e.target.closest('a'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})})();
(()=>{const images=[...document.querySelectorAll('main img')];if(!images.length)return;const lang=document.documentElement.lang,es=lang==='es',de=lang==='de';const dialog=document.createElement('dialog');dialog.className='photo-viewer';dialog.setAttribute('aria-label',es?'Vista ampliada de la foto':de?'Vergr\u00f6\u00dferte Ansicht':'Enlarged photo');dialog.innerHTML='<button class="photo-viewer-close" type="button" aria-label="'+(es?'Cerrar imagen':de?'Bild schlie\u00dfen':'Close image')+'"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button><figure><img alt=""><figcaption></figcaption></figure>';document.body.append(dialog);const largeSource=img=>{const srcset=img.getAttribute('srcset');if(!srcset)return img.currentSrc||img.src;const candidates=srcset.split(',').map(part=>part.trim().split(/\s+/)).filter(parts=>parts.length>1).sort((a,b)=>parseInt(b[1])-parseInt(a[1]));return candidates[0]?.[0]||img.currentSrc||img.src};const preview=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),close=dialog.querySelector('.photo-viewer-close');images.forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-haspopup','dialog');img.setAttribute('aria-label',(es?'Ampliar foto: ':de?'Foto vergr\u00f6\u00dfern: ':'Enlarge photo: ')+(img.alt||''));const open=()=>{preview.src=largeSource(img);preview.alt=img.alt;caption.textContent=img.alt;dialog.showModal();close.focus()};img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})})();
