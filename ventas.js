document.addEventListener('DOMContentLoaded', () => {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const tbody = document.querySelector('#sales-body');
    const totalSalesElement = document.getElementById('total-sales');
    const totalCashElement = document.getElementById('total-cash');
    const totalTransferElement = document.getElementById('total-transfer');
    const totalCardElement = document.getElementById('total-card');

    //Busqueda
    const searchSelect = document.getElementById("search-type");
    const searchInput = document.getElementById("search-monto");
    const searchButton = document.getElementById("search-btn");

    //Filtrado
    const filterSelect = document.getElementById("payment-method-type");
    const filterButton = document.getElementById("filter-btn");
    const cleanButton = document.getElementById("clean-btn");

    let selectedRow = null;

    // Elementos de la ventana modal
    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.querySelector('.close');
    const saveEditBtn = document.getElementById('save-edit');
    const editProductInput = document.getElementById('edit-product');
    const editValueInput = document.getElementById('edit-value');
    const editMethodSelect = document.getElementById('edit-method');
    let selectedSaleIndex = null; // Índice de la venta a editar

    // Función para renderizar las ventas y calcular subtotales
    function renderSales(filteredSales = null) {
        tbody.innerHTML = ''; // Limpiar la tabla
    
        const salesToRender = filteredSales || sales; // Si no hay filtro, usar todas las ventas.
    
        let total = 0;
        let totalCash = 0;
        let totalTransfer = 0;
        let totalCard = 0;
    
        salesToRender.forEach((sale, index) => {
            const row = document.createElement('tr');
            row.dataset.index = index;
            row.innerHTML = `
                <td>${sale.method}</td>
                <td>${sale.value}</td>
                <td>${sale.product}</td>
                <td>${sale.date}</td>
                <td>${sale.time}</td>
            `;
            tbody.appendChild(row);
    
            // Calcular subtotales según el método de pago
            const amount = parseFloat(sale.value);
            if (!isNaN(amount)) {
                total += amount;
                if (sale.method === "Efectivo") totalCash += amount;
                if (sale.method === "Transferencia") totalTransfer += amount;
                if (sale.method === "Tarjeta") totalCard += amount;
            }
        });
    
        // Actualizar los valores en el DOM
        totalCashElement.textContent = totalCash.toFixed(2);
        totalTransferElement.textContent = totalTransfer.toFixed(2);
        totalCardElement.textContent = totalCard.toFixed(2);
        totalSalesElement.textContent = total.toFixed(2);
    }

    // Llamar a renderSales al cargar la página
    renderSales();

    //Busuqeda
    searchButton.addEventListener("click", () => {
        const criterio = searchSelect.value;
        const monto = parseFloat(searchInput.value);
    
        if (isNaN(monto) || monto === 0) {
            renderSales(sales); // Si el monto es 0, se muestran todas las ventas.
            return;
        }
    
        // Filtrar las ventas dependiendo del criterio
        const filteredSales = sales.filter(sale => {
        const saleValue = parseFloat(sale.value);
    
            if (isNaN(saleValue)) return false; // Filtrar cualquier venta que no tenga un valor numérico válido
    
            switch (criterio) {
                case "=":
                    return saleValue === monto;
                case "Menor":
                    return saleValue < monto;
                case "Mayor":
                    return saleValue > monto;
                default:
                    return false;
            }
        });
        renderSales(filteredSales);
    });

    //Filtrado por metodo de pago
    filterButton.addEventListener("click", () => {
        const criterio = filterSelect.value;
    
        // Filtrar las ventas dependiendo del criterio
        const filteredSales = sales.filter(sale => {
            const saleMethod = sale.method;
    
            switch (criterio) {
                case "Efectivo":
                    return saleMethod === "Efectivo";
                case "Transferencia":
                    return saleMethod === "Transferencia";
                case "Tarjeta":
                    return saleMethod === "Tarjeta";
                default:
                    return false;
            }
        });
        renderSales(filteredSales);
    });

    //Liampiar el filtrado
    cleanButton.addEventListener("click", () => {
        renderSales(sales);
        return;
    });

    // Función para manejar la selección de filas
    tbody.addEventListener('click', (event) => {
        const clickedRow = event.target.closest('tr');
        if (!clickedRow) return;

        // Desmarcar fila anterior
        if (selectedRow) {
            selectedRow.classList.remove('selected');
        }

        // Marcar nueva fila seleccionada
        selectedRow = clickedRow;
        selectedRow.classList.add('selected');
    });

    // Función para abrir la ventana modal y cargar datos de la venta seleccionada
    document.getElementById('edit-sales').addEventListener('click', () => {
        if (!selectedRow) {
            alert('Seleccione una fila para editar.');
            return;
        }

        // Obtener índice de la fila seleccionada
        selectedSaleIndex = selectedRow.dataset.index;
        const sale = sales[selectedSaleIndex];

        // Cargar datos actuales en la modal
        editProductInput.value = sale.product;
        editValueInput.value = sale.value;
        editMethodSelect.value = sale.method;

        // Mostrar la ventana modal
        editModal.style.display = 'block';
    });

    // Función para guardar los cambios desde la modal
    saveEditBtn.addEventListener('click', () => {
        if (selectedSaleIndex === null) return;

        // Obtener los nuevos valores ingresados en la modal
        const newProduct = editProductInput.value.trim();
        const newValue = parseFloat(editValueInput.value);
        const newMethod = editMethodSelect.value;

        if (!newProduct || isNaN(newValue) || newValue <= 0) {
            alert("Ingrese valores válidos.");
            return;
        }

        // Actualizar los datos de la venta
        sales[selectedSaleIndex] = {
            ...sales[selectedSaleIndex],
            product: newProduct,
            value: newValue.toFixed(2),
            method: newMethod
        };
        localStorage.setItem('sales', JSON.stringify(sales));

        // Cerrar la modal y actualizar la tabla
        editModal.style.display = 'none';
        selectedSaleIndex = null;
        renderSales();
    });

    // Cerrar la modal al hacer clic en "X"
    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
        selectedSaleIndex = null;
    });

    // Cerrar la modal si el usuario hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
            selectedSaleIndex = null;
        }
    });

    // Función para eliminar la fila seleccionada
    document.getElementById('delete-sales').addEventListener('click', () => {
        if (!selectedRow) {
            alert('Seleccione una fila para eliminar.');
            return;
        }

        // Obtener el índice de la fila seleccionada
        const index = selectedRow.dataset.index;
        if (index > -1) {
            sales.splice(index, 1);
            localStorage.setItem('sales', JSON.stringify(sales));
        }

        // Eliminar la fila seleccionada y actualizar la tabla
        selectedRow.remove();
        selectedRow = null;
        renderSales();
    });

    // Función para descargar el archivo JSON
    function downloadJSON(data, filename) {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Función para manejar el cierre de caja
    document.getElementById('close-sales').addEventListener('click', () => {
        if (sales.length === 0) {
            alert('No hay registros de ventas para cerrar.');
            return;
        }

        // Descargar archivo JSON con los registros
        downloadJSON(sales, `ventas-${new Date().toLocaleDateString()}.json`);

        // Limpiar localStorage y actualizar la tabla
        if (confirm("¿Seguro que deseas limpiar las ventas? Asegúrate de haber guardado el archivo.")) {
            localStorage.removeItem('sales');
            alert('Caja cerrada y registros eliminados.');
            location.reload();
        }
    });
});
