// FarmLink global scripts

// Auto-hide alerts after 4 seconds
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        document.querySelectorAll('.alert').forEach(function (el) {
            var alert = bootstrap.Alert.getOrCreateInstance(el);
            alert.close();
        });
    }, 4000);
});

// Warn buyer on product-details page if quantity exceeds 10kg (bulk threshold)
function checkBulkQuantity(inputEl, warningEl, limit) {
    limit = limit || 10;
    var qty = parseFloat(inputEl.value) || 0;
    if (qty > limit) {
        warningEl.classList.remove('d-none');
    } else {
        warningEl.classList.add('d-none');
    }
}

// Simple client-side confirm for delete actions
function confirmDelete(msg) {
    return confirm(msg || 'Are you sure you want to delete this item?');
}
