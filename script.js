// Dummy product data
const products = [
    { id: 1, name: "Sandwich", price: 15 },
    { id: 2, name: "Coffee", price: 15 },
    // Add more products as needed
];

let tokenWindow = null; // Variable to store the reference to the token window
let tokenNumber = 0; // Initial token number
const readyQueue = []; // Queue to store tokens in the "Order Ready" section
const overdueQueue = []; // Queue to store tokens in the "Order Overdue" section
let isGeneratingToken = false; // Flag to track if token generation is in progress

// Function to display products
function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Clear previous list

    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.textContent = `${product.name} - ₹${product.price}`;
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.addEventListener('click', () => buyProduct(product.id));
        listItem.appendChild(buyButton);
        productList.appendChild(listItem);
    });
}

// Function to simulate order placement and token generation
function buyProduct(productId) {
    // Increment token number by one
    tokenNumber++;
    if (tokenNumber > 100) {
        tokenNumber = 1; // Reset token number if it exceeds 100
    }

    // Push the token to the "Order Ready" queue
    readyQueue.push(tokenNumber);

    // Open a new browser window to display the token number only if it hasn't been opened before
    if (!tokenWindow || tokenWindow.closed) {
        tokenWindow = window.open('', '_blank');
        tokenWindow.document.write(`
            <h1>Order Ready</h1>
            <ul id="order-ready"></ul>
            <h1>Order Overdue</h1>
            <ul id="order-overdue"></ul>
        `);
    }

    // Display the tokens in the "Order Ready" section
    updateTokenDisplay('order-ready', readyQueue);
}

// Function to update the token display in the specified section
function updateTokenDisplay(sectionId, queue) {
    const section = tokenWindow.document.getElementById(sectionId);
    section.innerHTML = ''; // Clear previous content

    queue.forEach(token => {
        const listItem = document.createElement('li');
        listItem.textContent = token;
        section.appendChild(listItem);
    });
}

// Move tokens from "Order Ready" to "Order Overdue" after 5 seconds
setInterval(() => {
    if (readyQueue.length > 0) {
        // Move the first token from the "Order Ready" queue to the "Order Overdue" queue
        const tokenToMove = readyQueue.shift();
        overdueQueue.push(tokenToMove);

        // Update the display in both sections
        updateTokenDisplay('order-ready', readyQueue);
        updateTokenDisplay('order-overdue', overdueQueue);
    }
}, 5000);

// Call displayProducts function when the page loads
window.onload = () => {
    displayProducts();
};
