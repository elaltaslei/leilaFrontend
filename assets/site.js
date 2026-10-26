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
        const dayKey=iso(cursor.getFullYear(),cursor.getMonth(),day),isPast=dayKey<todayKey,occupied=availability?.halfCharter?.[dayKey]||[],isConfirmed=availability?.confirmed.has(dayKey)===true&&!occupied.length,isPending=availability?.pending.has(dayKey)===true&&!availability?.confirmed.has(dayKey),fullBlocked=availability?.blocked.has(dayKey)===true,slots=window.LEILA_HALF_CHARTER?.slots||[{id:'morning'},{id:'afternoon'}],allHalfBusy=slots.every(slot=>occupied.includes(slot.id)),unavailable=fullBlocked||allHalfBusy;
        const button=document.createElement('button');button.type='button';button.textContent=day;
        button.disabled=loading||availability===null||isPast||unavailable;
        const dateLabel=new Date(cursor.getFullYear(),cursor.getMonth(),day).toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'});
        button.setAttribute('aria-label',dateLabel+' \u2014 '+(isPast?labels.past:isConfirmed?labels.confirmed:isPending?labels.pending:lang==='es'?'consulta, no confirmado':lang==='de'?'unverbindliche Anfrage':'request only, not confirmed'));
        if(isPast)button.classList.add('past-date');else if(fullBlocked)button.classList.add('confirmed-date');else if(occupied.length){button.classList.add('half-charter-date');const freeSlots=slots.filter(slot=>!occupied.includes(slot.id)).map(slot=>slot.start+'–'+slot.end);const availabilityNote=lang==='es'?'Solo queda Half Charter en: '+freeSlots.join(', '):lang==='de'?'Nur Half Charter verfügbar: '+freeSlots.join(', '):'Only Half Charter available: '+freeSlots.join(', ');button.title=availabilityNote;button.setAttribute('aria-label',dateLabel+' — '+availabilityNote)}else if(isPending)button.classList.add('pending-date');
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
    form.addEventListener('submit',async event=>{event.preventDefault();const dateError=validateDateNotPast();if(dateError){picked.textContent=dateError;dateInput.focus();return}if(!form.reportValidity())return;const apiBase=window.LEILA_API_BASE;if(!apiBase){status.hidden=false;status.textContent=labels.notConfigured;return}const data=Object.fromEntries(new FormData(form).entries());data.guests=Number(data.guests);const phoneNumber=data.phone.trim();data.phone=phoneNumber?`${document.querySelector('#phone-country-code').value} ${phoneNumber}`:'';data.language=lang;status.hidden=false;status.textContent=labels.sending;const submit=form.querySelector('[type="submit"]');submit.disabled=true;const sendRequest=async confirmDuplicate=>{window.LEILA_WAIT.start();let response,result;try{response=await fetch(apiBase.replace(/\/$/,'')+'/request-booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,...(confirmDuplicate?{confirmDuplicate:true}:{})})});result=await response.json().catch(()=>({}))}catch(error){status.textContent=error.message||labels.failed;await window.LEILA_WAIT.finish(false);return}if(response.status===409&&result.error?.code==='DUPLICATE_BOOKING_REQUEST'&&!confirmDuplicate){await window.LEILA_WAIT.finish(false);if(await window.LEILA_WAIT.confirmDuplicate(data.date))return sendRequest(true);status.hidden=false;status.textContent=lang==='es'?'No se ha enviado una segunda consulta.':lang==='de'?'Es wurde keine zweite Anfrage gesendet.':'No second enquiry was sent.';return}if(!response.ok){status.textContent=result.error?.message||labels.failed;await window.LEILA_WAIT.finish(false);return}status.textContent=result.status==='QUEUED'?labels.queued:labels.sent;await window.LEILA_WAIT.finish(true);cache.delete(monthKey());void loadAvailability()};try{await sendRequest(false)}finally{submit.disabled=false}})
  }
})();
;
(()=>{const nav=document.querySelector('.nav'),links=document.querySelector('.navlinks');if(!nav||!links)return;const b=document.createElement('button');b.type='button';b.className='menu-toggle';b.textContent='\u2630';b.setAttribute('aria-label',document.documentElement.lang==='es'?'Abrir men\u00fa':document.documentElement.lang==='de'?'Men\u00fc \u00f6ffnen':'Open menu');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','primary-links');links.id='primary-links';nav.insertBefore(b,links);const close=()=>{links.classList.remove('menu-open');b.setAttribute('aria-expanded','false')};b.addEventListener('click',()=>{const open=links.classList.toggle('menu-open');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?(document.documentElement.lang==='es'?'Cerrar men\u00fa':document.documentElement.lang==='de'?'Men\u00fc schlie\u00dfen':'Close menu'):(document.documentElement.lang==='es'?'Abrir men\u00fa':document.documentElement.lang==='de'?'Men\u00fc \u00f6ffnen':'Open menu'))});links.addEventListener('click',e=>{if(e.target.closest('a'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})})();
(()=>{const images=[...document.querySelectorAll('main img')];if(!images.length)return;const lang=document.documentElement.lang,es=lang==='es',de=lang==='de';const dialog=document.createElement('dialog');dialog.className='photo-viewer';dialog.setAttribute('aria-label',es?'Vista ampliada de la foto':de?'Vergr\u00f6\u00dferte Ansicht':'Enlarged photo');dialog.innerHTML='<button class="photo-viewer-close" type="button" aria-label="'+(es?'Cerrar imagen':de?'Bild schlie\u00dfen':'Close image')+'"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button><figure><img alt=""><figcaption></figcaption></figure>';document.body.append(dialog);const largeSource=img=>{const srcset=img.getAttribute('srcset');if(!srcset)return img.currentSrc||img.src;const candidates=srcset.split(',').map(part=>part.trim().split(/\s+/)).filter(parts=>parts.length>1).sort((a,b)=>parseInt(b[1])-parseInt(a[1]));return candidates[0]?.[0]||img.currentSrc||img.src};const preview=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),close=dialog.querySelector('.photo-viewer-close');images.forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-haspopup','dialog');img.setAttribute('aria-label',(es?'Ampliar foto: ':de?'Foto vergr\u00f6\u00dfern: ':'Enlarge photo: ')+(img.alt||''));const open=()=>{preview.src=largeSource(img);preview.alt=img.alt;caption.textContent=img.alt;dialog.showModal();close.focus()};img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})})();


;(()=>{const buttons=[...document.querySelectorAll(".exp-card")],panel=document.querySelector("#experience-panel");if(!buttons.length||!panel)return;const title=panel.querySelector("#experience-panel-title"),copy=panel.querySelector("#experience-panel-description"),close=panel.querySelector(".experience-close");let active=null;const hide=()=>{panel.hidden=true;buttons.forEach(button=>button.setAttribute("aria-expanded","false"));if(active)active.focus();active=null};buttons.forEach(button=>button.addEventListener("click",()=>{if(active===button){hide();return}buttons.forEach(item=>item.setAttribute("aria-expanded",String(item===button)));active=button;title.textContent=button.dataset.title||"";copy.textContent=button.dataset.copy||"";panel.hidden=false;panel.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});panel.focus({preventScroll:true})}));close?.addEventListener("click",hide)})();

;(()=>{const lang=document.documentElement.lang,es=lang==='es',de=lang==='de';const words=es?{title:'Enviando tu solicitud',copy:'Estamos preparando el env\u00edo. Enseguida tendr\u00e1s noticias.',done:'Solicitud enviada',processing:'Procesando',thanks:'¡Gracias! Hemos recibido tu consulta.',duplicateTitle:'Consulta ya recibida',duplicate:'Ya tenemos una consulta de este cliente sobre esta fecha. ¿Seguro que quieres enviar una segunda consulta de disponibilidad?',datePrefix:'Fecha: ',cancel:'Volver',continue:'Enviar otra consulta',cancelled:'No se ha enviado una segunda consulta.'}:de?{title:'Anfrage wird gesendet',copy:'Wir bereiten den Versand vor. Gleich erhaeltst du eine Rueckmeldung.',done:'Anfrage gesendet',processing:'Wird verarbeitet',thanks:'Vielen Dank! Wir haben deine Anfrage erhalten.',duplicateTitle:'Anfrage bereits erhalten',duplicate:'F\u00fcr diese E-Mail und dieses Datum liegt bereits eine Anfrage vor. M\u00f6chtest du wirklich eine zweite Verf\u00fcgbarkeitsanfrage senden?',datePrefix:'Datum: ',cancel:'Zur?ck',continue:'Weitere Anfrage senden',cancelled:'Es wurde keine zweite Anfrage gesendet.'}:{title:'Sending your enquiry',copy:'We are preparing your request. We will be with you shortly.',done:'Enquiry sent',processing:'Processing',thanks:'Thank you. We have received your enquiry.',duplicateTitle:'Enquiry already received',duplicate:'We already have an enquiry from this email for this date. Are you sure you want to send a second availability request?',datePrefix:'Date: ',cancel:'Go back',continue:'Send another enquiry',cancelled:'No second enquiry was sent.'};const overlay=document.createElement('div');overlay.className='booking-wait';overlay.hidden=true;overlay.innerHTML='<section class="booking-wait-card" role="dialog" aria-modal="true" aria-labelledby="booking-wait-title" aria-describedby="booking-wait-copy" tabindex="-1"><div class="booking-wait-eyebrow">LEILA &middot; YACHT EXPERIENCE</div><h2 id="booking-wait-title"></h2><p id="booking-wait-copy"></p><div class="booking-race" aria-hidden="true"><span class="booking-goal">&#9873;</span><svg class="booking-boat" viewBox="0 0 64 50"><path d="M31 3v35H8Z" fill="#f7f5f0"/><path d="M35 9v29h21Z" fill="#c6d6d2"/><path d="M5 40c15 5 37 5 54 0l-6 7c-15 4-29 4-43 0Z" fill="#102638"/><path d="M1 49c9-3 17 3 26 0s17-3 26 0 8 2 10 1" fill="none" stroke="#7899a2" stroke-width="2"/></svg><div class="booking-track"><span></span></div></div><div class="booking-progress-row"><span class="booking-progress-label"></span><span class="booking-percent">0%</span></div><div class="booking-progress" role="progressbar" aria-label="Request progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div></section>';document.body.append(overlay);const title=overlay.querySelector('h2'),copy=overlay.querySelector('p'),label=overlay.querySelector('.booking-progress-label'),percent=overlay.querySelector('.booking-percent'),bar=overlay.querySelector('.booking-progress'),barFill=bar.querySelector('span'),boat=overlay.querySelector('.booking-boat');title.textContent=words.title;copy.textContent=words.copy;label.textContent=words.processing;let timer=null,value=0,previousFocus=null;const render=()=>{const v=Math.round(value);percent.textContent=v+'%';bar.setAttribute('aria-valuenow',String(v));barFill.style.width=v+'%';boat.style.left=v+'%'};const keyHandler=e=>{if(e.key==='Escape'||e.key==='Tab')e.preventDefault()};const start=()=>{previousFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('booking-wait-open');document.addEventListener('keydown',keyHandler,true);value=0;render();requestAnimationFrame(()=>overlay.querySelector('.booking-wait-card').focus());timer=setInterval(()=>{value=Math.min(92,value+(value<60?2.7:value<82?1.2:.35));render()},180)};const finish=async success=>{clearInterval(timer);timer=null;if(success){value=100;render();label.textContent=words.done;copy.textContent=words.thanks;await new Promise(resolve=>setTimeout(resolve,900))}else await new Promise(resolve=>setTimeout(resolve,250));overlay.hidden=true;document.body.classList.remove('booking-wait-open');document.removeEventListener('keydown',keyHandler,true);if(previousFocus?.isConnected)previousFocus.focus()};const confirmDuplicate=date=>new Promise(resolve=>{const dialog=document.createElement('div');dialog.className='booking-wait booking-confirm';document.body.classList.add('booking-wait-open');dialog.innerHTML='<section class="booking-wait-card booking-confirm-card" role="dialog" aria-modal="true" aria-labelledby="booking-confirm-title" aria-describedby="booking-confirm-copy"><div class="booking-wait-eyebrow">LEILA ? YACHT EXPERIENCE</div><h2 id="booking-confirm-title"></h2><p id="booking-confirm-copy"></p><div class="booking-confirm-actions"><button class="booking-confirm-cancel" type="button"></button><button class="booking-confirm-continue" type="button"></button></div></section>';const heading=dialog.querySelector('h2'),message=dialog.querySelector('p');heading.textContent=words.duplicateTitle;const formattedDate=date?new Date(date+'T12:00:00').toLocaleDateString(es?'es-ES':de?'de-DE':'en-GB',{day:'numeric',month:'long',year:'numeric'}):'';message.textContent=words.duplicate+(formattedDate?' '+words.datePrefix+formattedDate+'.':'');const cancel=dialog.querySelector('.booking-confirm-cancel'),proceed=dialog.querySelector('.booking-confirm-continue');cancel.textContent=words.cancel;proceed.textContent=words.continue;document.body.append(dialog);const previous=document.activeElement;const close=value=>{dialog.remove();document.body.classList.remove('booking-wait-open');document.removeEventListener('keydown',trap,true);if(previous?.isConnected)previous.focus();resolve(value)};cancel.addEventListener('click',()=>close(false));proceed.addEventListener('click',()=>close(true));const trap=e=>{if(e.key==='Escape'){e.preventDefault();close(false)}else if(e.key==='Tab'){e.preventDefault();(document.activeElement===cancel?proceed:cancel).focus()}};document.addEventListener('keydown',trap,true);cancel.focus()});window.LEILA_WAIT={start,finish,confirmDuplicate}})();

;(()=>{
  const prefix=document.querySelector('#phone-country-code');
  if(!prefix)return;

  const picker=document.createElement('div');
  picker.className='phone-country-picker';
  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='phone-country-trigger';
  trigger.setAttribute('role','combobox');
  trigger.setAttribute('aria-haspopup','listbox');
  trigger.setAttribute('aria-expanded','false');
  trigger.id='phone-country-trigger';
  trigger.setAttribute('aria-controls','phone-country-options');
  const flag=document.createElement('img');
  flag.className='phone-flag';
  flag.alt='';
  flag.setAttribute('aria-hidden','true');
  const value=document.createElement('span');
  value.className='phone-country-value';
  trigger.append(flag,value);

  const options=document.createElement('div');
  options.className='phone-country-options';
  options.id='phone-country-options';
  options.setAttribute('role','listbox');
  options.setAttribute('aria-labelledby',trigger.id);
  options.hidden=true;
  const optionButtons=[...prefix.options].map(option=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='phone-country-option';
    button.setAttribute('role','option');
    button.setAttribute('aria-selected','false');
    const optionFlag=document.createElement('img');
    optionFlag.className='phone-flag';
    optionFlag.alt='';
    optionFlag.setAttribute('aria-hidden','true');
    optionFlag.src='../assets/flags/'+option.dataset.country+'.svg';
    const code=document.createElement('span');
    code.textContent=option.value;
    button.append(optionFlag,code);
    options.append(button);
    button.addEventListener('click',()=>{
      prefix.value=option.value;
      prefix.dispatchEvent(new Event('change',{bubbles:true}));
      close();
      trigger.focus();
    });
    return button;
  });

  const render=()=>{
    const selectedIndex=prefix.selectedIndex;
    const selected=prefix.options[selectedIndex];
    if(!selected)return;
    flag.src='../assets/flags/'+selected.dataset.country+'.svg';
    value.textContent=selected.value;
    trigger.setAttribute('aria-label',(prefix.getAttribute('aria-label')||'Country calling code')+' '+selected.value);
    optionButtons.forEach((button,index)=>button.setAttribute('aria-selected',String(index===selectedIndex)));
  };
  const close=()=>{
    options.hidden=true;
    trigger.setAttribute('aria-expanded','false');
  };
  const open=()=>{
    options.hidden=false;
    trigger.setAttribute('aria-expanded','true');
    optionButtons[prefix.selectedIndex]?.focus();
  };

  picker.addEventListener('focusout',event=>{if(!picker.contains(event.relatedTarget))close()});
  trigger.addEventListener('click',()=>options.hidden?open():close());
  trigger.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      open();
    }
  });
  options.addEventListener('keydown',event=>{
    const current=optionButtons.indexOf(document.activeElement);
    if(event.key==='Escape'){
      event.preventDefault();
      close();
      trigger.focus();
    }else if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      const delta=event.key==='ArrowDown'?1:-1;
      optionButtons[(current+delta+optionButtons.length)%optionButtons.length]?.focus();
    }else if(event.key==='Home'||event.key==='End'){
      event.preventDefault();
      optionButtons[event.key==='Home'?0:optionButtons.length-1]?.focus();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(!picker.contains(event.target))close();
  });
  prefix.classList.add('phone-country-native');
  prefix.tabIndex=-1;
  prefix.setAttribute('aria-hidden','true');
  prefix.parentElement.insertBefore(picker,prefix);
  picker.append(trigger,options);
  prefix.addEventListener('change',render);
  render();
})();
