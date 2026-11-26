(() => {
    'use strict';

    const $ = id => document.getElementById(id);
    const n = id => Math.max(0, Number($(id).value) || 0);
    const brl = value => Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    let trip = 'one';
    let wait = 'hourly';
    const HISTORY_KEY = 'felmor-company-confirmed-trips-v1';
    const fieldIds = [
        'client', 'date', 'purpose', 'origin', 'destination',
        'km', 'hours', 'rateKm', 'rateHour',
        'waitHours', 'waitRate', 'waitFixed',
        'tolls', 'parking', 'meals', 'other', 'otherDesc',
        'taxEnabled', 'taxRate', 'notes'
    ];

    function calc() {
        const factor = trip === 'round' ? 2 : 1;
        const km = n('km') * factor;
        const hours = n('hours') * factor;
        const kmCost = km * n('rateKm');
        const hourCost = hours * n('rateHour');

        const waitCost = wait === 'hourly'
            ? n('waitHours') * n('waitRate')
            : wait === 'fixed'
                ? n('waitFixed')
                : 0;

        const extras = n('tolls') + n('parking') + n('meals') + n('other');
        const subtotal = kmCost + hourCost + waitCost + extras;
        const taxOn = $('taxEnabled').value === 'yes';
        const rate = taxOn ? Math.min(n('taxRate'), 99.99) : 0;
        const final = taxOn ? subtotal / (1 - rate / 100) : subtotal;
        const tax = final - subtotal;

        $('final').textContent = brl(final);
        $('tripLabel').textContent = trip === 'round' ? 'Ida e volta' : 'Somente ida';
        $('sKm').textContent = km.toLocaleString('pt-BR') + ' km';
        $('sHours').textContent = hours.toLocaleString('pt-BR') + ' h';
        $('sKmCost').textContent = brl(kmCost);
        $('sHourCost').textContent = brl(hourCost);
        $('sWait').textContent = brl(waitCost);
        $('sExtras').textContent = brl(extras);
        $('sSubtotal').textContent = brl(subtotal);
        $('taxLabel').textContent = `Imposto (${rate.toLocaleString('pt-BR')}%)`;
        $('sTax').textContent = brl(tax);
        $('sFinal').textContent = brl(final);

        $('formula').textContent = taxOn && rate
            ? `${brl(subtotal)} ÷ ${(1 - rate / 100).toLocaleString('pt-BR', { maximumFractionDigits: 4 })} = ${brl(final)}. Cálculo por dentro.`
            : `Subtotal: ${brl(subtotal)}. ${taxOn ? 'Alíquota igual a zero.' : 'Sem imposto.'}`;

        return { km, hours, kmCost, hourCost, waitCost, extras, subtotal, rate, tax, final };
    }

    function setTrip(value) {
        trip = value;
        document.querySelectorAll('[data-trip]').forEach(button => {
            button.classList.toggle('active', button.dataset.trip === trip);
        });
        calc();
    }

    function setWait(value) {
        wait = value;
        document.querySelectorAll('[data-wait]').forEach(button => {
            button.classList.toggle('active', button.dataset.wait === wait);
        });
        $('waitHoursBox').classList.toggle('hidden', wait !== 'hourly');
        $('waitRateBox').classList.toggle('hidden', wait !== 'hourly');
        $('waitFixedBox').classList.toggle('hidden', wait !== 'fixed');
        calc();
    }

    function safe(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }

    function getHistory() {
        try {
            const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    }

    function renderHistory() {
        const list = $('historyList');
        const items = getHistory();

        if (!items.length) {
            list.innerHTML = '<p class="empty-history">Nenhuma viagem salva ainda.</p>';
            return;
        }

        list.innerHTML = items.slice().reverse().map(item => {
            const fields = item.fields || {};
            const name = fields.client || 'Cliente não informado';
            const route = [fields.origin || 'Origem?', fields.destination || 'Destino?'].join(' → ');
            const date = fields.date
                ? new Date(fields.date + 'T12:00:00').toLocaleDateString('pt-BR')
                : 'Sem data';

            return `
                <article class="history-item">
                    <div class="history-top">
                        <div>
                            <strong>${safe(name)}</strong>
                            <small>${safe(route)} · ${date}</small>
                        </div>
                        <strong>${brl(item.final)}</strong>
                    </div>
                    <div class="history-actions">
                        <button type="button" data-load="${safe(item.id)}">Editar / carregar</button>
                        <button type="button" class="delete" data-delete="${safe(item.id)}">Excluir</button>
                    </div>
                </article>
            `;
        }).join('');

        list.querySelectorAll('[data-load]').forEach(button => {
            button.addEventListener('click', () => loadRecord(button.dataset.load));
        });

        list.querySelectorAll('[data-delete]').forEach(button => {
            button.addEventListener('click', () => deleteRecord(button.dataset.delete));
        });
    }

    function saveHistory(items) {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
            renderHistory();
            return true;
        } catch (error) {
            alert('Não foi possível salvar. O armazenamento do navegador pode estar cheio ou bloqueado.');
            return false;
        }
    }

    function currentRecord() {
        const result = calc();
        const fields = {};
        fieldIds.forEach(id => {
            fields[id] = $(id).value;
        });

        return {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            savedAt: new Date().toISOString(),
            trip,
            wait,
            fields,
            final: result.final,
            subtotal: result.subtotal
        };
    }

    function saveTrip() {
        const record = currentRecord();
        const editingId = $('saveTrip').dataset.editing;
        const items = getHistory();

        if (editingId) {
            const index = items.findIndex(item => item.id === editingId);
            if (index >= 0) {
                record.id = editingId;
                items[index] = record;
            } else {
                items.push(record);
            }
            delete $('saveTrip').dataset.editing;
            $('saveTrip').textContent = '＋ Salvar orçamento no histórico';
        } else {
            items.push(record);
        }

        if (saveHistory(items)) {
            alert('Orçamento salvo no histórico deste navegador.');
        }
    }

    function loadRecord(id) {
        const record = getHistory().find(item => item.id === id);
        if (!record) return;

        fieldIds.forEach(key => {
            if (record.fields && record.fields[key] !== undefined) {
                $(key).value = record.fields[key];
            }
        });

        setTrip(record.trip || 'one');
        setWait(record.wait || 'none');

        $('taxBox').classList.toggle('hidden', $('taxEnabled').value !== 'yes');
        calc();

        $('saveTrip').textContent = 'Salvar alterações no histórico';
        $('saveTrip').dataset.editing = id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteRecord(id) {
        if (!confirm('Excluir esta viagem do histórico?')) return;

        saveHistory(getHistory().filter(item => item.id !== id));

        if ($('saveTrip').dataset.editing === id) {
            delete $('saveTrip').dataset.editing;
            $('saveTrip').textContent = '＋ Salvar orçamento no histórico';
        }
    }

    function clearForm() {
        if (!confirm('Deseja limpar este orçamento?')) return;

        document.querySelectorAll('input').forEach(input => {
            input.value = input.type === 'date' ? '' : '0';
        });

        ['client', 'purpose', 'origin', 'destination', 'otherDesc'].forEach(id => {
            $(id).value = '';
        });

        $('notes').value = '';
        $('taxEnabled').value = 'no';
        $('taxBox').classList.add('hidden');

        delete $('saveTrip').dataset.editing;
        $('saveTrip').textContent = '＋ Salvar orçamento no histórico';

        setTrip('one');
        setWait('hourly');
        calc();
    }

    function generatePdf() {
        const result = calc();
        const value = id => $(id).value.trim() || 'Não informado';
        const date = $('date').value
            ? new Date($('date').value + 'T12:00:00').toLocaleDateString('pt-BR')
            : 'Não informada';
        const waitDescription = wait === 'hourly'
            ? `${n('waitHours')} h × ${brl(n('waitRate'))}/h`
            : wait === 'fixed' ? 'Valor fixo estipulado' : 'Sem espera';
        const row = (label, amount) => `<tr><td>${safe(label)}</td><td>${safe(amount)}</td></tr>`;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Permita pop-ups para gerar o orçamento em PDF.');
            return;
        }

        printWindow.document.open();
        printWindow.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Orçamento AGUIAR Transporte</title>
<style>
body{font:13px Arial;color:#34251f;margin:35px}
header{border-bottom:3px solid #ed742b;padding-bottom:16px;margin-bottom:22px}
.brand{font-size:25px;font-weight:900;letter-spacing:3px;color:#e86b24}
.sub{font-size:10px;letter-spacing:2px;color:#88766c}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:20px 0}
.info{border-bottom:1px solid #ddd;padding:8px 0}
.info b{display:block;font-size:9px;color:#88766c;margin-bottom:4px}
.section{font-size:11px;font-weight:bold;letter-spacing:1px;margin:22px 0 8px;color:#e86b24}
table{width:100%;border-collapse:collapse}
td{padding:10px 8px;border-bottom:1px solid #eee}
td:last-child{text-align:right;font-weight:bold}
tr.total td{font-size:16px;font-weight:900;border-top:2px solid #ed742b;color:#e86b24}
.notes{white-space:pre-wrap;background:#fff7f2;padding:12px;line-height:1.5}
.foot{margin-top:35px;border-top:1px solid #ddd;padding-top:12px;text-align:center;color:#88766c;font-size:9px}
@media print{body{margin:18mm}}
</style>
</head>
<body>
<header>
    <div class="brand">AGUIAR</div>
    <div class="sub">TRANSPORTE DE EMPRESAS · PROPOSTA COMERCIAL</div>
</header>
<h2>Orçamento de viagem corporativa</h2>
<div class="grid">
    <div class="info"><b>CLIENTE</b>${safe(value('client'))}</div>
    <div class="info"><b>DATA</b>${safe(date)}</div>
    <div class="info"><b>ORIGEM</b>${safe(value('origin'))}</div>
    <div class="info"><b>DESTINO</b>${safe(value('destination'))}</div>
    <div class="info"><b>FINALIDADE</b>${safe(value('purpose'))}</div>
    <div class="info"><b>MODALIDADE</b>${trip === 'round' ? 'Ida e volta' : 'Somente ida'}</div>
</div>
<div class="section">DETALHAMENTO DOS CUSTOS</div>
<table>
${row(`Quilometragem (${result.km} km × ${brl(n('rateKm'))}/km)`, brl(result.kmCost))}
${row(`Percurso (${result.hours} h × ${brl(n('rateHour'))}/h)`, brl(result.hourCost))}
${row(`Espera (${waitDescription})`, brl(result.waitCost))}
${row('Pedágios', brl(n('tolls')))}
${row('Estacionamento', brl(n('parking')))}
${row('Alimentação / diária', brl(n('meals')))}
${row($('otherDesc').value || 'Outros custos', brl(n('other')))}
${row('Subtotal antes do imposto', brl(result.subtotal))}
${row(`Imposto (${result.rate}%) — cálculo por dentro`, brl(result.tax))}
<tr class="total"><td>VALOR FINAL DO ORÇAMENTO</td><td>${brl(result.final)}</td></tr>
</table>
${$('notes').value ? `<div class="section">OBSERVAÇÕES E CONDIÇÕES</div><div class="notes">${safe($('notes').value)}</div>` : ''}
<div class="foot">AGUIAR TRANSPORTE DE EMPRESAS · Documento de orçamento, não é nota fiscal.</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
</body>
</html>`);
        printWindow.document.close();
    }


    let currentStep = 1;

    function showStep(step) {
        const totalSteps = document.querySelectorAll('.wizard-step').length;
        currentStep = Math.max(1, Math.min(totalSteps, step));

        document.querySelectorAll('.wizard-step').forEach(section => {
            const isActive = Number(section.dataset.step) === currentStep;
            section.classList.toggle('active', isActive);
            section.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        document.querySelectorAll('.progress-step').forEach(item => {
            const number = Number(item.dataset.progress);
            item.classList.toggle('current', number === currentStep);
            item.classList.toggle('completed', number < currentStep);
        });

        const progressFill = $('progressFill');
        if (progressFill) {
            progressFill.style.width = `${((currentStep - 1) / Math.max(1, totalSteps - 1)) * 100}%`;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function bindWizardNavigation() {
        document.querySelectorAll('.wizard-next').forEach(button => {
            button.type = 'button';
            button.addEventListener('click', event => {
                event.preventDefault();
                showStep(currentStep + 1);
            });
        });

        document.querySelectorAll('.wizard-back').forEach(button => {
            button.type = 'button';
            button.addEventListener('click', event => {
                event.preventDefault();
                showStep(currentStep - 1);
            });
        });
    }

    function init() {
        bindWizardNavigation();
        // Garante que os botões principais tenham seus eventos vinculados.
        $('saveTrip').addEventListener('click', saveTrip);
        $('pdf').addEventListener('click', generatePdf);
        $('clear').addEventListener('click', clearForm);

        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('input', calc);
            element.addEventListener('change', calc);
        });

        document.querySelectorAll('[data-trip]').forEach(button => {
            button.addEventListener('click', () => setTrip(button.dataset.trip));
        });

        document.querySelectorAll('[data-wait]').forEach(button => {
            button.addEventListener('click', () => setWait(button.dataset.wait));
        });

        $('taxEnabled').addEventListener('change', () => {
            $('taxBox').classList.toggle('hidden', $('taxEnabled').value !== 'yes');
            calc();
        });

        $('theme').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const dark = document.body.classList.contains('dark');
            $('theme').textContent = dark ? '☀ Modo claro' : '☾ Modo escuro';
            try {
                localStorage.setItem('felmor-company-theme', dark ? 'dark' : 'light');
            } catch (error) {}
        });

        try {
            if (localStorage.getItem('felmor-company-theme') === 'dark') {
                document.body.classList.add('dark');
                $('theme').textContent = '☀ Modo claro';
            }
        } catch (error) {}

        if (!$('date').value) {
            $('date').value = new Date().toISOString().slice(0, 10);
        }

        renderHistory();
        calc();
        showStep(1);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
