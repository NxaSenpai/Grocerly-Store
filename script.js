const params = new URLSearchParams(window.location.search);
const category = params.get("category");

document.querySelectorAll('.item').forEach(item => {
  if (item.classList.contains(category)) {
    item.classList.remove('hidden');
  } else {
    item.classList.add('hidden');
  }
});





function addToCartFromProductPage(buttonElement) {
        // Extract item data from data- attributes
        const item = {
            id: buttonElement.dataset.itemId,
            name: buttonElement.dataset.itemName,
            price: parseFloat(buttonElement.dataset.itemPrice), // Convert price to a number
            image: buttonElement.dataset.itemImage,
            unit: buttonElement.dataset.itemUnit
        };

        // Call the addToCart function (which is exposed globally from cart.html)
        if (typeof window.addToCart === 'function') {
            window.addToCart(item);
            console.log(`Added "${item.name}" to cart.`);
            // You can add visual feedback here (e.g., a small "Added to Cart!" message)
        } else {
            console.error("Error: 'addToCart' function not found. Ensure the script from cart.html is loaded.");
            // Fallback: If addToCart isn't available, manually add to localStorage
            let currentCart = JSON.parse(localStorage.getItem('grocerlyCart') || '[]');
            const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);

            if (existingItemIndex > -1) {
                currentCart[existingItemIndex].quantity += 1;
            } else {
                currentCart.push({ ...item, quantity: 1 });
            }
            localStorage.setItem('grocerlyCart', JSON.stringify(currentCart));
            console.log(`Added "${item.name}" to cart (via fallback).`);
            // Optionally, you might redirect to the cart page here or show a temporary message.
        }
    }













    const CART_STORAGE_KEY = 'grocerlyCart';
    const SHIPPING_COST = 1.99;
    
    let cart = [];

    function loadCart() {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            cart = storedCart ? JSON.parse(storedCart) : [];
            // console.log('Cart loaded from localStorage:', JSON.parse(JSON.stringify(cart)));
        } catch (e) {
            console.error("Error loading cart from localStorage:", e);
            cart = []; // Reset cart on error
        }
    }
    
    // Save cart to localStorage
    function saveCart() {
        try {
            const cartJson = JSON.stringify(cart);
            localStorage.setItem(CART_STORAGE_KEY, cartJson);
            // console.log('Cart saved to localStorage successfully.');
        } catch (e) {
            console.error("Error saving cart to localStorage:", e);
        }
    }
    
    // --- Cart Operations ---
    
    // Add item to cart or update quantity if it exists
    function addToCart(item) {
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        saveCart();
        // Only call renderCartItems if on the cart page (optional, but prevents errors if elements aren't present)
        if (document.getElementById('cart-items-container')) {
            renderCartItems();
        }
        updateCartIconCount(); // Update the cart icon count across all pages
    }
    
    // Update item quantity in cart
    function updateQuantity(itemId, change) {
        const itemToUpdate = cart.find(cartItem => cartItem.id === itemId);
        if (itemToUpdate) {
            itemToUpdate.quantity += change;
            if (itemToUpdate.quantity <= 0) {
                removeItem(itemId); // Calls removeItem, which handles saving and updating icon/rendering
            } else {
                saveCart();
                if (document.getElementById('cart-items-container')) {
                    renderCartItems();
                }
                updateCartIconCount(); // Update the cart icon count
            }
        }
    }
    
    // Remove item from cart
    function removeItem(itemId) {
        cart = cart.filter(cartItem => cartItem.id !== itemId); 
        saveCart();
        if (document.getElementById('cart-items-container')) {
            renderCartItems();
        }
        updateCartIconCount(); // Update the cart icon count
    }
    
    // --- Rendering Functions (primarily for cart.html) ---
    
    // Render all cart items to the DOM (only effective on cart.html)
    function renderCartItems() {
        const container = document.getElementById('cart-items-container');
        const emptyMessage = document.getElementById('empty-cart-message');
    
        if (!container || !emptyMessage) return; // Exit if elements are not found (e.g., not on cart.html)
    
        container.innerHTML = ''; // Clear existing items
    
        if (cart.length === 0) {
            emptyMessage.classList.remove('hidden'); // Show the message
        } else {
            emptyMessage.classList.add('hidden'); // Hide the message
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('flex', 'items-center', 'justify-between', 'border-b', 'border-gray-200', 'pb-4');
                itemElement.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <img class="w-16 h-16 object-contain rounded-md" src="${item.image}" alt="${item.name}">
                        <div>
                            <h3 class="text-lg md:text-xl font-open-sans font-semibold">${item.name}</h3>
                            <p class="text-gray-600 text-sm md:text-base">$${item.price.toFixed(2)} / ${item.unit}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center border border-gray-300 rounded-md">
                            <button class="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-l-md" data-item-id="${item.id}" data-action="decrease">-</button>
                            <span class="px-3 py-1 text-gray-800">${item.quantity}</span>
                            <button class="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-r-md" data-item-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <p class="text-lg md:text-xl font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="text-red-500 hover:text-red-700" data-item-id="${item.id}" data-action="remove">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                `;
                container.appendChild(itemElement);
            });
        }
        calculateCartTotals();
    }
    
    // Calculate and display cart totals (only effective on cart.html)
    function calculateCartTotals() {
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
    
        if (!subtotalEl || !shippingEl || !totalEl) return; // Exit if elements not found
    
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
    
        const shipping = (subtotal > 50) ? 0 : (cart.length > 0 ? SHIPPING_COST : 0);
        const total = subtotal + shipping;
        
    
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        shippingEl.textContent = `$${shipping.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }
    
    // --- Update Cart Icon Count (for navigation bar) ---
    function updateCartIconCount() {
        const cartCountElement = document.getElementById('cart-item-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            if (totalItems === 0) {
                cartCountElement.classList.add('hidden');
            } else {
                cartCountElement.classList.remove('hidden');
            }
        }
    }
    
    // --- Product Page Add to Cart Function ---
    // This function needs to be called from the onclick of your product buttons
    window.addToCartFromProductPage = function(buttonElement) {
        const item = {
            id: buttonElement.dataset.itemId,
            name: buttonElement.dataset.itemName,
            price: parseFloat(buttonElement.dataset.itemPrice),
            image: buttonElement.dataset.itemImage,
            unit: buttonElement.dataset.itemUnit
        };
        addToCart(item); // Call the core addToCart function
        // Optional: Add a subtle visual feedback on the product page, e.g., a small pop-up
        // console.log(`${item.name} added to cart!`);
    };
    
    // --- Initial Load & Event Listeners for Cart Page ---
    document.addEventListener('DOMContentLoaded', () => {
        loadCart();
        updateCartIconCount(); // Update cart count on all pages that load this script
    
        // Only set up cart item rendering and controls if on cart.html
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (cartItemsContainer) {
            renderCartItems(); // Render items specifically for cart.html
            // Event delegation for quantity and remove buttons on cart.html
            cartItemsContainer.addEventListener('click', (event) => {
                const target = event.target.closest('button');
                if (!target) return;
    
                const itemId = target.dataset.itemId;
                const action = target.dataset.action;
    
                if (itemId && action) {
                    if (action === 'increase') {
                        updateQuantity(itemId, 1);
                    } else if (action === 'decrease') {
                        updateQuantity(itemId, -1);
                    } else if (action === 'remove') {
                        removeItem(itemId);
                    }
                }
            });
        }
    });
