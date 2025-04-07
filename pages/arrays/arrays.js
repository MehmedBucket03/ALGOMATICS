
const arrayContainer = document.getElementById('array-container');
const addItemButton = document.getElementById('add-item');
const deleteItemButton = document.getElementById('delete-item');
const itemValueInput = document.getElementById('item-value');
const deleteIndexInput = document.getElementById('delete-index');
const explanation = document.getElementById('explanation');
const arrayLength = document.getElementById('array-length');
let array = [];

addItemButton.addEventListener('click', () => {
    const newValue = itemValueInput.value;
    if (newValue === '') return;

    array.push(newValue);
    updateArrayDisplay();

    // Show explanation
    explanation.textContent = 'The item has been added to the end of the array.';
    explanation.style.display = 'block';
    setTimeout(() => {
        explanation.style.display = 'none';
    }, 3000);

    // Clear the input field
    itemValueInput.value = '';
});

deleteItemButton.addEventListener('click', async () => {
    const indexToDelete = deleteIndexInput.value;
    if (indexToDelete === '' || indexToDelete < 0 || indexToDelete >= array.length) return;

    array.splice(indexToDelete, 1);
    await updateArrayDisplay(indexToDelete);

    // Show explanation
    explanation.textContent = 'The item has been deleted and the array has been updated.';
    explanation.style.display = 'block';
    setTimeout(() => {
        explanation.style.display = 'none';
    }, 3000);

    // Clear the input field
    deleteIndexInput.value = '';
});

async function updateArrayDisplay(deletedIndex = -1) {
    arrayContainer.innerHTML = '';
    for (let index = 0; index < array.length; index++) {
        const value = array[index];
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'flex flex-col items-center';

        const itemElement = document.createElement('div');
        itemElement.className = 'array-item';
        itemElement.textContent = value;

        // Highlight items that are shifted
        if (deletedIndex !== -1 && index >= deletedIndex) {
            itemElement.classList.add('highlight');
            await new Promise(resolve => setTimeout(resolve, 1000));
            itemElement.classList.remove('highlight');
        }

        // Create index label
        const indexLabel = document.createElement('div');
        indexLabel.className = 'index-label';
        indexLabel.textContent = `${index}`;

        itemWrapper.appendChild(itemElement);
        itemWrapper.appendChild(indexLabel);
        arrayContainer.appendChild(itemWrapper);
    }

    // Update array length display
    arrayLength.textContent = `Array Length: ${array.length} (Next index: ${array.length})`;
}
