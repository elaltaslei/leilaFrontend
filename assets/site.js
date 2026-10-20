(()=>{
  'use strict';
  const lang=document.documentElement.lang;
  const paymentMessages={es:{checking:'Verificando el pago y confirmando la reserva...',success:'Pago confirmado. Tu reserva está confirmada.',pending:'Stripe todavía no confirma el pago. Si ya pagaste, vuelve a cargar esta página en unos segundos.',failed:'No se pudo confirmar la reserva automáticamente. Contacta con LEILA para verificar el pago.'},en:{checking:'Verifying your payment and confirming the booking...',success:'Payment confirmed. Your booking is confirmed.',pending:'Stripe has not confirmed the payment yet. If you have paid, reload this page in a few seconds.',failed:'The booking could not be confirmed automatically. Please contact LEILA to verify the payment.'},de:{checking:'Zahlung wird geprüft und die Buchung bestätigt...',success:'Zahlung bestätigt. Deine Buchung ist bestätigt.',pending:'Stripe hat die Zahlung noch nicht bestätigt. Wenn du bezahlt hast, lade diese Seite in einigen Sekunden neu.',failed:'Die Buchung konnte nicht automatisch bestätigt werden. Bitte kontaktiere LEILA, um die Zahlung zu prüfen.'}}[lang]||{checking:'Verifying your payment...',success:'Payment confirmed.',pending:'Stripe has not confirmed the payment yet.',failed:'The booking could not be confirmed automatically.'};
  const labels={
    en:{months:['January','February','March','April','May','June','July','August','September','October','November','December'],days:['M','T','W','T','F','S','S'],selected:'Preferred date selected',pending:'Pending enquiry',past:'Past date',loading:'Checking Google Calendar availability...',calendarError:'Availability could not be loaded. Please try again later.',confirmed:'Confirmed booking',sending:'Sending enquiry...',sent:'Your enquiry has been sent to LEILA. The date is not confirmed until the captain accepts and you complete payment.',queued:'This date is in the two-hour priority period of an earlier request. Your request is queued; no Stripe payment link was created.',failed:'The enquiry could not be sent. Check your connection and try again.',notConfigured:'Online enquiries are not available yet. Please email leilaexperiencereservas@gmail.com.'},
    es:{months:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],days:['L','M','X','J','V','S','D'],selected:'Fecha preferida seleccionada',pending:'Consulta pendiente',past:'Fecha pasada',loading:'Consultando la disponibilidad del calendario de Google...',calendarError:'No se pudo consultar la disponibilidad. Int\u00e9ntalo de nuevo m\u00e1s tarde.',confirmed:'Reserva confirmada',sending:'Enviando consulta...',sent:'Tu solicitud se ha enviado a LEILA. La fecha no est\u00e1 confirmada hasta que el capit\u00e1n la acepte y completes el pago.',queued:'Esta fecha est\u00e1 en el per\u00edodo de prioridad de otra solicitud. Tu consulta queda en cola y no se ha creado ning\u00fan enlace de Stripe.',failed:'No se pudo enviar la solicitud. Comprueba la conexi\u00f3n e int\u00e9ntalo de nuevo.',notConfigured:'El formulario de consultas online todav\u00eda no est\u00e1 configurado. Escribe a leilaexperiencereservas@gmail.com.'},
    de:{months:['Januar','Februar','M\u00e4rz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],days:['M','D','M','D','F','S','S'],selected:'Wunschtermin ausgew\u00e4hlt',pending:'Offene Anfrage',past:'Vergangenes Datum',loading:'Google-Kalender wird gepr\u00fcft...',calendarError:'Die Verf\u00fcgbarkeit konnte nicht geladen werden. Bitte sp\u00e4ter erneut versuchen.',confirmed:'Buchung best\u00e4tigt',sending:'Anfrage wird gesendet...',sent:'Deine Anfrage wurde an LEILA gesendet. Der Termin ist erst best\u00e4tigt, wenn der Kapit\u00e4n sie annimmt und du die Zahlung abgeschlossen hast.',queued:'F\u00fcr dieses Datum l\u00e4uft bereits eine zweist\u00fcndige Vorrangfrist. Deine Anfrage ist vorgemerkt; es wurde kein Stripe-Zahlungslink erstellt.',failed:'Die Anfrage konnte nicht gesendet werden. Bitte pr\u00fcfe deine Verbindung und versuche es erneut.',notConfigured:'Online-Anfragen sind noch nicht verf\u00fcgbar. Bitte schreibe an leilaexperiencereservas@gmail.com.'}
  }[lang]||{months:['January','February','March','April','May','June','July','August','September','October','November','December'],days:['M','T','W','T','F','S','S'],selected:'Preferred date selected',pending:'Pending enquiry',past:'Past date',loading:'Checking Google Calendar availability...',calendarError:'Availability could not be loaded. Please try again later.',confirmed:'Confirmed booking',sending:'Sending enquiry...',sent:'Your enquiry has been sent to LEILA. The date is not confirmed until the captain accepts and you complete payment.',failed:'The enquiry could not be sent. Check your connection and try again.',notConfigured:'Online enquiries are not available yet. Please email leilaexperiencereservas@gmail.com.'};
  const dateInput=document.querySelector('#date'),title=document.querySelector('#cal-title'),grid=document.querySelector('#cal-days'),picked=document.querySelector('#picked'),prev=document.querySelector('#prev'),next=document.querySelector('#next');
  const todayInMadrid=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),part=type=>parts.find(value=>value.type===type)?.value;return part('year')+'-'+part('month')+'-'+part('day')};
  const validateDateNotPast=()=>{const value=String(dateInput?.value||'').trim(),start=value.match(/^(\d{4}-\d{2}-\d{2})/),missing=lang==='es'?'Selecciona una fecha en el calendario.':lang==='de'?'Bitte wähle ein Datum im Kalender.':'Choose a date from the calendar.',past=lang==='es'?'La fecha debe ser hoy o posterior.':lang==='de'?'Das Datum muss heute oder später sein.':'The date must be today or later.',error=!value?missing:start&&start[1]<todayInMadrid()?past:'';dateInput?.setCustomValidity(error);return error};
  const typeInput=document.querySelector('#type'),priceOutput=document.querySelector('#charter-price');
  const slotField=document.createElement('div');slotField.className='field full';slotField.hidden=true;
  const slotLabel=document.createElement('label');slotLabel.htmlFor='slot';slotLabel.textContent=lang==='es'?'Horario Half Charter':lang==='de'?'Half Charter Zeitfenster':'Half Charter time slot';
  const slotInput=document.createElement('select');slotInput.id='slot';slotInput.name='slot';slotInput.innerHTML='<option value="">'+(lang==='es'?'Elige un horario':lang==='de'?'Zeitfenster auswÃ¤hlen':'Choose a time slot')+'</option>';
  (window.LEILA_HALF_CHARTER?.slots||[{id:'morning',start:'10:00',end:'14:00'},{id:'afternoon',start:'16:00',end:'20:00'}]).forEach(slot=>{const option=document.createElement('option');option.value=slot.id;option.dataset.time=slot.start+'–'+slot.end;option.textContent=option.dataset.time;slotInput.append(option)});
  slotField.append(slotLabel,slotInput);typeInput?.closest('.field')?.after(slotField);
  const normalizeCharterType=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
  const isHalfSelected=()=>normalizeCharterType(typeInput?.value)==='halfcharter';
  const updateCharterPrice=()=>{
    if(!typeInput||!priceOutput)return;
    const type=typeInput.value.toLowerCase(),locale=lang==='es'?'es-ES':lang==='de'?'de-DE':'en-GB';
    const money=value=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
    const prices=window.LEILA_PRICES||{};
    const euroAmount=key=>Number.isFinite(prices[key])?prices[key]:null;
    let amount=null,description='';
    if(type.includes('half charter'))amount=euroAmount('halfCharter');
    else if(type.includes('day charter')||type.includes('tagescharter'))amount=euroAmount('dayCharter');
    else if(type.includes('sunset')||type.includes('puesta')||type.includes('abendt'))amount=euroAmount('sunsetSail');
    else if(type.includes('multi-day')||type.includes('varios d')||type.includes('mehrt')){
      const range=String(dateInput?.value||'').match(/^(\d{4}-\d{2}-\d{2})(?:\s*(?:\/|to|al|–|—)\s*(\d{4}-\d{2}-\d{2}))?$/i);
      if(range&&range[2]){
        const days=Math.round((Date.parse(range[2]+'T00:00:00Z')-Date.parse(range[1]+'T00:00:00Z'))/86400000)+1;
        const perDay=euroAmount('multiDayPerDay');if(days>0&&perDay!==null){amount=perDay*days;description=`${money(perDay)} × ${days} ${lang==='es'?(days===1?'día':'días'):lang==='de'?(days===1?'Tag':'Tage'):(days===1?'day':'days')} = ${money(amount)}`}
      }
      if(amount===null){const perDay=euroAmount('multiDayPerDay');description=lang==='es'?`${money(perDay)}/día · total según los días indicados`:lang==='de'?`${money(perDay)}/Tag · Gesamtpreis je nach angegebenen Tagen`:`${money(perDay)}/day · total depends on the dates entered`}
    }
    else if(type.includes('weekly')||type.includes('semanal')||type.includes('wochen'))amount=euroAmount('weeklyCharter');
    else if(type.includes('tailored')||type.includes('itinerario')||type.includes('individuell'))amount=euroAmount('tailoredItinerary');
    else if(type.includes('special')||type.includes('celebración')||type.includes('besonder'))amount=euroAmount('specialOccasion');
    if(amount!==null&&!description)description=money(amount);
    priceOutput.hidden=!type;
    if(type)priceOutput.textContent=(lang==='es'?'Precio: ':lang==='de'?'Preis: ':'Price: ')+description;
  };
  let draw=()=>{};
  typeInput?.addEventListener('change',()=>{updateCharterPrice();slotField.hidden=!isHalfSelected();slotInput.required=isHalfSelected();if(!isHalfSelected())slotInput.value='';if(grid)draw()});
  slotInput.addEventListener('change',()=>{if(grid)draw()});
  slotField.hidden=!isHalfSelected();slotInput.required=isHalfSelected();
  dateInput?.addEventListener('input',()=>{updateCharterPrice();validateDateNotPast()});
  dateInput?.addEventListener('change',validateDateNotPast);
  updateCharterPrice();
  if(grid){
    let cursor=new Date();cursor.setDate(1);
    let chosen=null,chosenStartKey=null,rangeStart=null,rangeEnd=null,availability=null,loading=true,loadVersion=0;
    const cache=new Map();
    const locale=lang==='es'?'es-ES':lang==='de'?'de-DE':'en-GB';
    const iso=(year,month,day)=>year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    const monthKey=()=>iso(cursor.getFullYear(),cursor.getMonth(),1).slice(0,7);
    draw=()=>{
      title.textContent=labels.months[cursor.getMonth()]+' '+cursor.getFullYear();
      grid.replaceChildren();
      labels.days.forEach(day=>{const el=document.createElement('span');el.textContent=day;el.setAttribute('aria-hidden','true');grid.append(el)});
      const offset=(cursor.getDay()+6)%7;
      for(let i=0;i<offset;i++){const spacer=document.createElement('button');spacer.disabled=true;spacer.tabIndex=-1;spacer.setAttribute('aria-hidden','true');grid.append(spacer)}
      const count=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
      const todayKey=todayInMadrid();
      for(let day=1;day<=count;day++){
        const dayKey=iso(cursor.getFullYear(),cursor.getMonth(),day),isPast=dayKey<todayKey,isConfirmed=availability?.confirmed.has(dayKey)===true,isPending=availability?.pending.has(dayKey)===true&&!isConfirmed,occupied=availability?.halfCharter?.[dayKey]||[],fullBlocked=availability?.blocked.has(dayKey)===true,slots=window.LEILA_HALF_CHARTER?.slots||[{id:'morning'},{id:'afternoon'}],allHalfBusy=slots.every(slot=>occupied.includes(slot.id)),unavailable=fullBlocked||allHalfBusy;
        const button=document.createElement('button');button.type='button';button.textContent=day;
        button.disabled=loading||availability===null||isPast||unavailable;
        const dateLabel=new Date(cursor.getFullYear(),cursor.getMonth(),day).toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'});
        button.setAttribute('aria-label',dateLabel+' \u2014 '+(isPast?labels.past:isConfirmed?labels.confirmed:isPending?labels.pending:lang==='es'?'consulta, no confirmado':lang==='de'?'unverbindliche Anfrage':'request only, not confirmed'));
        if(isPast)button.classList.add('past-date');else if(unavailable)button.classList.add('confirmed-date');else if(occupied.length){button.classList.add('partial-date');const freeSlots=slots.filter(slot=>!occupied.includes(slot.id)).map(slot=>slot.start+'–'+slot.end);const availabilityNote=lang==='es'?'Solo queda Half Charter en: '+freeSlots.join(', '):lang==='de'?'Nur Half Charter verfügbar: '+freeSlots.join(', '):'Only Half Charter available: '+freeSlots.join(', ');button.title=availabilityNote;button.setAttribute('aria-label',dateLabel+' — '+availabilityNote)}else if(isPending)button.classList.add('pending-date');
        if(dayKey===chosenStartKey||dayKey===rangeEnd)button.classList.add('selected');else if(rangeEnd&&dayKey>chosenStartKey&&dayKey<rangeEnd)button.classList.add('range-date');
        if(!button.disabled)button.addEventListener('click',()=>{
          if(occupied.length&&!isHalfSelected()&&typeInput){typeInput.value=window.LEILA_HALF_CHARTER?.type||'Half Charter';typeInput.dispatchEvent(new Event('change',{bubbles:true}))}
          if(isHalfSelected()){
            chosen=new Date(cursor.getFullYear(),cursor.getMonth(),day);chosenStartKey=dayKey;rangeStart=null;rangeEnd=null;dateInput.value=dayKey;
            const freeSlots=slots.filter(slot=>!occupied.includes(slot.id)).map(slot=>slot.start+'–'+slot.end);const availabilityNote=occupied.length?(lang==='es'?' · Para este día solo queda un Half Charter con el horario: ':lang==='de'?' · Für diesen Tag ist nur noch ein Half Charter zu dieser Zeit verfügbar: ':' · Only one Half Charter remains on this day, at: ')+freeSlots.join(', '):'';picked.textContent=labels.selected+': '+chosen.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'})+availabilityNote;
            slotInput.querySelectorAll('option').forEach(option=>{if(!option.value)return;const busy=occupied.includes(option.value);option.disabled=busy;option.hidden=busy;option.textContent=option.dataset.time});if(slotInput.value&&occupied.includes(slotInput.value))slotInput.value='';
            validateDateNotPast();updateCharterPrice();draw();return;
          }
          if(rangeStart&&rangeStart>=todayKey&&dayKey>rangeStart){
            const start=rangeStart;rangeEnd=dayKey;rangeStart=null;chosenStartKey=start;dateInput.value=start+'/'+dayKey;
            const first=new Date(start+'T00:00:00'),last=new Date(dayKey+'T00:00:00');
            picked.textContent=(lang==='es'?'Intervalo seleccionado: ':lang==='de'?'Zeitraum ausgewählt: ':'Date range selected: ')+first.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'})+' – '+last.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'});
          }else{
            chosen=new Date(cursor.getFullYear(),cursor.getMonth(),day);chosenStartKey=dayKey;rangeStart=dayKey;rangeEnd=null;dateInput.value=dayKey;
            picked.textContent=labels.selected+': '+chosen.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'})+' '+(lang==='es'?'(haz clic en otro día posterior para elegir un intervalo)':lang==='de'?'(für einen Zeitraum auf einen späteren Tag klicken)':'(click a later day to choose a range)');
          }
          validateDateNotPast();updateCharterPrice();draw();
        });
        grid.append(button);
      }
    };
    const loadAvailability=async()=>{
      const key=monthKey(),version=++loadVersion;
      if(cache.has(key)){const cached=cache.get(key);availability={pending:new Set(cached.pending),confirmed:new Set(cached.confirmed),blocked:new Set(cached.blocked||[]),halfCharter:cached.halfCharter||{}};loading=false;if(!chosen)picked.textContent='';draw();return}
      availability=null;loading=true;picked.textContent=labels.loading;draw();
      try{
        const apiBase=window.LEILA_API_BASE;if(!apiBase)throw new Error(labels.notConfigured);
        const from=iso(cursor.getFullYear(),cursor.getMonth(),1),to=iso(cursor.getFullYear(),cursor.getMonth(),new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate());
        const url=apiBase.replace(/\/$/,'')+'/calendar-availability?from='+from+'&to='+to;
        const response=await fetch(url,{cache:'no-store'}),dates=await response.json();
        if(!response.ok||!Array.isArray(dates.pending)||!Array.isArray(dates.confirmed)||!Array.isArray(dates.blocked))throw new Error(labels.calendarError);
        if(version!==loadVersion)return;
        cache.set(key,dates);availability={pending:new Set(dates.pending),confirmed:new Set(dates.confirmed),blocked:new Set(dates.blocked),halfCharter:dates.halfCharter||{}};loading=false;if(!chosen)picked.textContent='';draw();
      }catch(error){if(version!==loadVersion)return;availability=null;loading=false;picked.textContent=error.message===labels.notConfigured?error.message:labels.calendarError;draw()}
    };
    prev.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()-1);void loadAvailability()});
    next.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()+1);void loadAvailability()});
    void loadAvailability();
    const form=document.querySelector('#request-form'),status=document.querySelector('#request-status');
    const paymentParams=new URLSearchParams(window.location.search),checkoutSessionId=paymentParams.get('session_id');
    if(paymentParams.get('payment')==='success'&&checkoutSessionId){
      paymentParams.delete('session_id');window.history.replaceState({},'',window.location.pathname+(paymentParams.size?'?'+paymentParams.toString():'')+window.location.hash);
      status.hidden=false;status.textContent=paymentMessages.checking;
      const apiBase=window.LEILA_API_BASE;
      if(apiBase)fetch(apiBase.replace(/\/$/,'')+'/checkout/confirm?session_id='+encodeURIComponent(checkoutSessionId),{cache:'no-store'}).then(async response=>{const result=await response.json().catch(()=>({}));if(!response.ok){if(response.status===409)throw new Error(paymentMessages.pending);throw new Error(paymentMessages.failed)}return result}).then(()=>{status.textContent=paymentMessages.success;cache.delete(monthKey());void loadAvailability()}).catch(error=>{status.textContent=error.message||paymentMessages.failed});
      else status.textContent=paymentMessages.failed;
    }
    form.addEventListener('submit',async event=>{event.preventDefault();const dateError=validateDateNotPast();if(dateError){picked.textContent=dateError;dateInput.focus();return}if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form).entries());data.guests=Number(data.guests);data.language=lang;status.hidden=false;status.textContent=labels.sending;const submit=form.querySelector('[type="submit"]');submit.disabled=true;try{const apiBase=window.LEILA_API_BASE;if(!apiBase)throw new Error(labels.notConfigured);const response=await fetch(apiBase.replace(/\/$/,'')+'/request-booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error?.message||labels.failed);status.textContent=result.status==='QUEUED'?labels.queued:labels.sent;cache.delete(monthKey());void loadAvailability()}catch(error){status.textContent=error.message||labels.failed}finally{submit.disabled=false}})
  }
})();
;
(()=>{const nav=document.querySelector('.nav'),links=document.querySelector('.navlinks');if(!nav||!links)return;const b=document.createElement('button');b.type='button';b.className='menu-toggle';b.textContent='\u2630';b.setAttribute('aria-label',document.documentElement.lang==='es'?'Abrir men\u00fa':document.documentElement.lang==='de'?'Men\u00fc \u00f6ffnen':'Open menu');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','primary-links');links.id='primary-links';nav.insertBefore(b,links);const close=()=>{links.classList.remove('menu-open');b.setAttribute('aria-expanded','false')};b.addEventListener('click',()=>{const open=links.classList.toggle('menu-open');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?(document.documentElement.lang==='es'?'Cerrar men\u00fa':document.documentElement.lang==='de'?'Men\u00fc schlie\u00dfen':'Close menu'):(document.documentElement.lang==='es'?'Abrir men\u00fa':document.documentElement.lang==='de'?'Men\u00fc \u00f6ffnen':'Open menu'))});links.addEventListener('click',e=>{if(e.target.closest('a'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})})();
(()=>{const images=[...document.querySelectorAll('main img')];if(!images.length)return;const lang=document.documentElement.lang,es=lang==='es',de=lang==='de';const dialog=document.createElement('dialog');dialog.className='photo-viewer';dialog.setAttribute('aria-label',es?'Vista ampliada de la foto':de?'Vergr\u00f6\u00dferte Ansicht':'Enlarged photo');dialog.innerHTML='<button class="photo-viewer-close" type="button" aria-label="'+(es?'Cerrar imagen':de?'Bild schlie\u00dfen':'Close image')+'"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button><figure><img alt=""><figcaption></figcaption></figure>';document.body.append(dialog);const largeSource=img=>{const srcset=img.getAttribute('srcset');if(!srcset)return img.currentSrc||img.src;const candidates=srcset.split(',').map(part=>part.trim().split(/\s+/)).filter(parts=>parts.length>1).sort((a,b)=>parseInt(b[1])-parseInt(a[1]));return candidates[0]?.[0]||img.currentSrc||img.src};const preview=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),close=dialog.querySelector('.photo-viewer-close');images.forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-haspopup','dialog');img.setAttribute('aria-label',(es?'Ampliar foto: ':de?'Foto vergr\u00f6\u00dfern: ':'Enlarge photo: ')+(img.alt||''));const open=()=>{preview.src=largeSource(img);preview.alt=img.alt;caption.textContent=img.alt;dialog.showModal();close.focus()};img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})})();
