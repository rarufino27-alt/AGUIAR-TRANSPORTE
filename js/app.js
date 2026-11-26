const $=id=>document.getElementById(id), n=id=>Math.max(0,Number($(id).value)||0), brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let trip='one',wait='hourly';
function calc(){
 const f=trip==='round'?2:1,km=n('km')*f,h=n('hours')*f,kmCost=km*n('rateKm'),hourCost=h*n('rateHour');
 const waitCost=wait==='hourly'?n('waitHours')*n('waitRate'):wait==='fixed'?n('waitFixed'):0;
 const extras=n('tolls')+n('parking')+n('meals')+n('other'),subtotal=kmCost+hourCost+waitCost+extras;
 const taxOn=$('taxEnabled').value==='yes',rate=taxOn?Math.min(n('taxRate'),99.99):0,final=taxOn?subtotal/(1-rate/100):subtotal,tax=final-subtotal;
 $('final').textContent=brl(final);$('tripLabel').textContent=trip==='round'?'Ida e volta':'Somente ida';
 $('sKm').textContent=km.toLocaleString('pt-BR')+' km';$('sHours').textContent=h.toLocaleString('pt-BR')+' h';
 $('sKmCost').textContent=brl(kmCost);$('sHourCost').textContent=brl(hourCost);$('sWait').textContent=brl(waitCost);
 $('sExtras').textContent=brl(extras);$('sSubtotal').textContent=brl(subtotal);$('taxLabel').textContent=`Imposto (${rate.toLocaleString('pt-BR')}%)`;
 $('sTax').textContent=brl(tax);$('sFinal').textContent=brl(final);
 $('formula').textContent=taxOn&&rate?`${brl(subtotal)} ÷ ${(1-rate/100).toLocaleString('pt-BR',{maximumFractionDigits:4})} = ${brl(final)}. Cálculo por dentro.`:`Subtotal: ${brl(subtotal)}. ${taxOn?'Alíquota igual a zero.':'Sem imposto.'}`;
 return {km,h,kmCost,hourCost,waitCost,extras,subtotal,rate,tax,final};
}
document.querySelectorAll('input,select,textarea').forEach(e=>e.addEventListener('input',calc));
document.querySelectorAll('[data-trip]').forEach(b=>b.onclick=()=>{trip=b.dataset.trip;document.querySelectorAll('[data-trip]').forEach(x=>x.classList.toggle('active',x===b));calc()});
document.querySelectorAll('[data-wait]').forEach(b=>b.onclick=()=>{wait=b.dataset.wait;document.querySelectorAll('[data-wait]').forEach(x=>x.classList.toggle('active',x===b));$('waitHoursBox').classList.toggle('hidden',wait!=='hourly');$('waitRateBox').classList.toggle('hidden',wait!=='hourly');$('waitFixedBox').classList.toggle('hidden',wait!=='fixed');calc()});
$('taxEnabled').onchange=()=>{$('taxBox').classList.toggle('hidden',$('taxEnabled').value!=='yes');calc()};
$('theme').onclick=()=>{document.body.classList.toggle('dark');let d=document.body.classList.contains('dark');$('theme').textContent=d?'☀ Modo claro':'☾ Modo escuro';try{localStorage.setItem('felmor-company-theme',d?'dark':'light')}catch(e){}};
try{if(localStorage.getItem('felmor-company-theme')==='dark'){document.body.classList.add('dark');$('theme').textContent='☀ Modo claro'}}catch(e){}
$('pdf').onclick=()=>{
 const c=calc(),val=id=>$(id).value.trim()||'Não informado',date=$('date').value?new Date($('date').value+'T12:00:00').toLocaleDateString('pt-BR'):'Não informada';
 const waitDesc=wait==='hourly'?`${n('waitHours')} h × ${brl(n('waitRate'))}/h`:wait==='fixed'?'Valor fixo estipulado':'Sem espera';
 const safe=s=>String(s).replace(/[&<>"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]));
 const row=(a,b)=>`<tr><td>${safe(a)}</td><td>${safe(b)}</td></tr>`;
 const w=window.open('','_blank');if(!w){alert('Permita pop-ups para gerar o orçamento em PDF.');return}
 w.document.write(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Orçamento Felmor</title><style>body{font:13px Arial;color:#1b2b40;margin:35px}header{border-bottom:3px solid #c59a45;padding-bottom:16px;margin-bottom:22px}.brand{font-size:25px;font-weight:900;letter-spacing:3px;color:#173b60}.sub{font-size:10px;letter-spacing:2px;color:#65758a}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:20px 0}.info{border-bottom:1px solid #ddd;padding:8px 0}.info b{display:block;font-size:9px;color:#718096;margin-bottom:4px}.section{font-size:11px;font-weight:bold;letter-spacing:1px;margin:22px 0 8px;color:#173b60}table{width:100%;border-collapse:collapse}td{padding:10px 8px;border-bottom:1px solid #e3e7ec}td:last-child{text-align:right;font-weight:bold}tr.total td{font-size:16px;font-weight:900;border-top:2px solid #c59a45;color:#173b60}.notes{white-space:pre-wrap;background:#f5f7f9;padding:12px;line-height:1.5}.foot{margin-top:35px;border-top:1px solid #ddd;padding-top:12px;text-align:center;color:#8290a0;font-size:9px}@media print{body{margin:18mm}}</style><body>
 <header><div class="brand">FELMOR</div><div class="sub">TRANSPORTE DE EMPRESAS · PROPOSTA COMERCIAL</div></header><h2>Orçamento de viagem corporativa</h2>
 <div class="grid"><div class="info"><b>CLIENTE</b>${safe(val('client'))}</div><div class="info"><b>DATA</b>${date}</div><div class="info"><b>ORIGEM</b>${safe(val('origin'))}</div><div class="info"><b>DESTINO</b>${safe(val('destination'))}</div><div class="info"><b>FINALIDADE</b>${safe(val('purpose'))}</div><div class="info"><b>MODALIDADE</b>${trip==='round'?'Ida e volta':'Somente ida'}</div></div>
 <div class="section">DETALHAMENTO DOS CUSTOS</div><table>
 ${row(`Quilometragem (${c.km} km × ${brl(n('rateKm'))}/km)`,brl(c.kmCost))}
 ${row(`Percurso (${c.h} h × ${brl(n('rateHour'))}/h)`,brl(c.hourCost))}
 ${row(`Espera (${waitDesc})`,brl(c.waitCost))}
 ${row('Pedágios',brl(n('tolls')))}${row('Estacionamento',brl(n('parking')))}${row('Alimentação / diária',brl(n('meals')))}
 ${row($('otherDesc').value||'Outros custos',brl(n('other')))}${row('Subtotal antes do imposto',brl(c.subtotal))}
 ${row(`Imposto (${c.rate}%) — cálculo por dentro`,brl(c.tax))}<tr class="total"><td>VALOR FINAL DO ORÇAMENTO</td><td>${brl(c.final)}</td></tr></table>
 ${$('notes').value?`<div class="section">OBSERVAÇÕES E CONDIÇÕES</div><div class="notes">${safe($('notes').value)}</div>`:''}
 <div class="foot">FELMOR TRANSPORTE DE EMPRESAS · Documento de orçamento, não é nota fiscal.</div><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close();
};
$('clear').onclick=()=>{if(!confirm('Deseja limpar este orçamento?'))return;document.querySelectorAll('input').forEach(e=>e.value=e.type==='date'?'':'0');['client','purpose','origin','destination','otherDesc'].forEach(id=>$(id).value='');$('notes').value='';$('taxEnabled').value='no';$('taxBox').classList.add('hidden');trip='one';wait='hourly';document.querySelectorAll('[data-trip]').forEach(b=>b.classList.toggle('active',b.dataset.trip==='one'));document.querySelectorAll('[data-wait]').forEach(b=>b.classList.toggle('active',b.dataset.wait==='hourly'));$('waitHoursBox').classList.remove('hidden');$('waitRateBox').classList.remove('hidden');$('waitFixedBox').classList.add('hidden');calc()};

const HISTORY_KEY='felmor-company-confirmed-trips-v1';
const fieldIds=['client','date','purpose','origin','destination','km','hours','rateKm','rateHour','waitHours','waitRate','waitFixed','tolls','parking','meals','other','otherDesc','taxEnabled','taxRate','notes'];
function currentRecord(){
 const c=calc();
 const fields={};fieldIds.forEach(id=>fields[id]=$(id).value);
 return {id: (typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(16).slice(2),
   savedAt:new Date().toISOString(),trip,wait,fields,final:c.final,subtotal:c.subtotal};
}
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch(e){return []}}
function putHistory(items){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(items));renderHistory();return true}catch(e){alert('Não foi possível salvar. O armazenamento do navegador pode estar cheio ou bloqueado.');return false}}
function renderHistory(){
 const list=$('historyList'),items=getHistory();
 if(!items.length){list.innerHTML='<p class="empty-history">Nenhuma viagem salva ainda.</p>';return}
 list.innerHTML=items.slice().reverse().map(item=>{
  const f=item.fields||{},name=f.client||'Cliente não informado',route=[f.origin||'Origem?',f.destination||'Destino?'].join(' → ');
  const date=f.date?new Date(f.date+'T12:00:00').toLocaleDateString('pt-BR'):'Sem data';
  return `<article class="history-item"><div class="history-top"><div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(route)} · ${date}</small></div><strong>${brl(Number(item.final)||0)}</strong></div><div class="history-actions"><button data-load="${escapeHtml(item.id)}">Editar / carregar</button><button class="delete" data-delete="${escapeHtml(item.id)}">Excluir</button></div></article>`;
 }).join('');
 list.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>loadRecord(b.dataset.load));
 list.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteRecord(b.dataset.delete));
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function loadRecord(id){
 const item=getHistory().find(x=>x.id===id);if(!item)return;
 fieldIds.forEach(key=>{if(item.fields&&item.fields[key]!==undefined)$(key).value=item.fields[key]});
 trip=item.trip||'one';wait=item.wait||'none';
 document.querySelectorAll('[data-trip]').forEach(b=>b.classList.toggle('active',b.dataset.trip===trip));
 document.querySelectorAll('[data-wait]').forEach(b=>b.classList.toggle('active',b.dataset.wait===wait));
 $('taxBox').classList.toggle('hidden',$('taxEnabled').value!=='yes');
 $('waitHoursBox').classList.toggle('hidden',wait!=='hourly');$('waitRateBox').classList.toggle('hidden',wait!=='hourly');$('waitFixedBox').classList.toggle('hidden',wait!=='fixed');
 calc();window.scrollTo({top:0,behavior:'smooth'});
 $('saveTrip').textContent='Salvar alterações no histórico';
 $('saveTrip').dataset.editing=id;
}
function deleteRecord(id){
 if(!confirm('Excluir esta viagem do histórico?'))return;
 putHistory(getHistory().filter(x=>x.id!==id));
 if($('saveTrip').dataset.editing===id){delete $('saveTrip').dataset.editing;$('saveTrip').textContent='＋ Salvar orçamento no histórico'}
}
$('saveTrip').onclick=()=>{
 const record=currentRecord(),editing=$('saveTrip').dataset.editing;
 const items=getHistory();
 if(editing){const index=items.findIndex(x=>x.id===editing);if(index>=0){record.id=editing;items[index]=record}else items.push(record);delete $('saveTrip').dataset.editing;$('saveTrip').textContent='＋ Salvar orçamento no histórico'}
 else items.push(record);
 if(putHistory(items))alert('Orçamento salvo no histórico deste navegador.');
};
renderHistory();

$('date').value=new Date().toISOString().slice(0,10);calc();