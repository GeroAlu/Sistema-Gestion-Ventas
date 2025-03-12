document.getElementById('calculate-btn').addEventListener('click', () => {
    const productValue = parseFloat(document.getElementById('product-value').value);
    const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
    const change = paymentAmount - productValue;

    if (isNaN(change) || change < 0) {
        alert('El pago es insuficiente.');
        return;
    }

    document.getElementById('change').value = change.toFixed(2);

    // Mostrar billetes a devolver
    const denominations = [10000, 2000, 1000, 500, 200, 100, 50, 20];
    let changeDetails = '';
    let remainingChange = change;

    // Calcular billetes a devolver
    denominations.forEach(denomination => {
        const count = Math.floor(remainingChange / denomination);
        if (count > 0) {
            changeDetails += `${count} billete(s) de ${denomination}<br>`;
            remainingChange %= denomination;
        }
    });

    // Mostrar monto restante que no se puede cubrir con billetes
    const leftoverChange = remainingChange.toFixed(2);
    if (leftoverChange > 0) {
        changeDetails += `y $${leftoverChange}`;
    }

    document.getElementById('change-details').innerHTML = changeDetails;
});

document.getElementById('register-btn').addEventListener('click', () => {
    const product = document.getElementById('product-name').value;
    const value = parseFloat(document.getElementById('product-value').value);
    const method = document.getElementById('payment-method').value;
    const date = new Date();

    if (!isNaN(value)) {
        const sale = {
            method: method,
            value: value.toFixed(2),
            product: product,
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };

        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        sales.push(sale);
        localStorage.setItem('sales', JSON.stringify(sales));

        alert('Venta registrada correctamente.');

        // Limpiar los campos de entrada
        document.getElementById('product-name').value = '';
        document.getElementById('product-value').value = '';
        document.getElementById('payment-amount').value = '';
        document.getElementById('change').value = '';
        document.getElementById('change-details').innerHTML = '';
    } else {
        alert('Ingresar precio para registrar la venta.');
    }
});