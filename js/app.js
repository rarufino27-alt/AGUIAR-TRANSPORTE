
const $ = id => document.getElementById(id);

const n = id => Math.max(0, Number($(id).value) || 0);

const brl = v =>
    v.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

let trip = 'one';
let wait = 'hourly';


function calc() {
    const f = trip === 'round' ? 2 : 1;

    const km = n('km') * f;
    const h = n('hours') * f;

    const kmCost = km * n('rateKm');
    const hourCost = h * n('rateHour');

    const waitCost =
        wait === 'hourly'
            ? n('waitHours') * n('waitRate')
            : wait === 'fixed'
                ? n('waitFixed')
                : 0;

    const extras =
        n('tolls') +
        n('parking') +
        n('meals') +
        n('other');

    const subtotal =
        kmCost +
        hourCost +
        waitCost +
        extras;

    const taxOn = $('taxEnabled').value === 'yes';

    const rate = taxOn
        ? Math.min(n('taxRate'), 99.99)
        : 0;

    const final = taxOn
        ? subtotal / (1 - rate / 100)
        : subtotal;

    const tax = final - subtotal;

    $('final').textContent = brl(final);

    $('tripLabel').textContent =
        trip === 'round' ? 'Ida e volta' : 'Somente ida';

    $('sKm').textContent =
        km.toLocaleString('pt-BR') + ' km';

    $('sHours').textContent =
        h.toLocaleString('pt-BR') + ' h';

    $('sKmCost').textContent = brl(kmCost);
    $('sHourCost').textContent = brl(hourCost);
    $('sWait').textContent = brl(waitCost);
    $('sExtras').textContent = brl(extras);
    $('sSubtotal').textContent = brl(subtotal);

    $('taxLabel').textContent =
        `Imposto (${rate.toLocaleString('pt-BR')}%)`;

    $('sTax').textContent = brl(tax);
    $('sFinal').textContent = brl(final);

    $('formula').textContent =
        taxOn && rate
            ? `${brl(subtotal)} ÷ ${(1 - rate / 100).toLocaleString('pt-BR', {
                maximumFractionDigits: 4
            })} = ${brl(final)}. Cálculo por dentro.`
            : `Subtotal: ${brl(subtotal)}. ${
                taxOn ? 'Alíquota igual a zero.' : 'Sem imposto.'
            }`;

    return {
        km,
        h,
        kmCost,
        hourCost,
        waitCost,
        extras,
        subtotal,
        rate,
        tax,
        final
    };
}


document.querySelectorAll('input,select,textarea').forEach(e => {
    e.addEventListener('input', calc);
});


document.querySelectorAll('[data-trip]').forEach(b => {
    b.onclick = () => {
        trip = b.dataset.trip;

        document.querySelectorAll('[data-trip]').forEach(x => {
            x.classList.toggle('active', x === b);
        });

        calc();
    };
});


document.querySelectorAll('[data-wait]').forEach(b => {
    b.onclick = () => {
        wait = b.dataset.wait;

        document.querySelectorAll('[data-wait]').forEach(x => {
            x.classList.toggle('active', x === b);
        });

        $('waitHoursBox').classList.toggle('hidden', wait !== 'hourly');
        $('waitRateBox').classList.toggle('hidden', wait !== 'hourly');
        $('waitFixedBox').classList.toggle('hidden', wait !== 'fixed');

        calc();
    };
});


$('taxEnabled').onchange = () => {
    $('taxBox').classList.toggle(
        'hidden',
        $('taxEnabled').value !== 'yes'
    );

    calc();
};


$('theme').onclick = () => {
    document.body.classList.toggle('dark');

    let d = document.body.classList.contains('dark');

    $('theme').textContent =
        d ? '☀ Modo claro' : '☾ Modo escuro';

    try {
        localStorage.setItem(
            'felmor-company-theme',
            d ? 'dark' : 'light'
        );
    } catch (e) {}
};


try {
    if (localStorage.getItem('felmor-company-theme') === 'dark') {
        document.body.classList.add('dark');
        $('theme').textContent = '☀ Modo claro';
    }
} catch (e) {}
