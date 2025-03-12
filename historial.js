document.getElementById('load-history').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        alert('Por favor, seleccione un archivo JSON válido.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const salesData = JSON.parse(e.target.result);
            if (!Array.isArray(salesData)) throw new Error("El formato del archivo no es correcto.");
            displayHistory(salesData);
        } catch (error) {
            alert('Error al leer el archivo JSON. Verifique el formato.');
        }
    };
    reader.readAsText(file);
});

const totalSalesElement = document.getElementById('total-sales');

function displayHistory(data) {
    const tbody = document.querySelector('#history-table tbody');
    tbody.innerHTML = ''; 
    let total = 0;

    data.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.method}</td>
            <td>${parseFloat(sale.value.toString().replace(',', '.')).toFixed(2)}</td>
            <td>${sale.product}</td>
            <td>${sale.date}</td>
            <td>${sale.time}</td>
        `;
        tbody.appendChild(row);

        // Agregar al total solo si es un número válido
        const amount = parseFloat(sale.value.toString().replace(',', '.'));
        if (!isNaN(amount)) {
            total += amount;
        }
    });

    totalSalesElement.textContent = (isNaN(total) ? 0 : total.toFixed(2));
}

document.getElementById('clear-history').addEventListener('click', () => {
    document.querySelector('#history-table tbody').innerHTML = '';
    totalSalesElement.textContent = '0.00';
});
