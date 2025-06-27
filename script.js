const CART_STORAGE_KEY = 'grocerlyCart';
        const SHIPPING_COST = 1.99;
        let cart = []; // Initialize cart array

        // --- Cart Core Functions ---
        function loadCart() {
            try {
                const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                cart = storedCart ? JSON.parse(storedCart) : [];
            } catch (e) {
                console.error("Error loading cart from localStorage:", e);
                cart = [];
            }
        }

        function saveCart() {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            } catch (e) {
                console.error("Error saving cart to localStorage:", e);
            }
        }

        function addToCart(item) {
            const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push({ ...item, quantity: 1 });
            }
            saveCart();
            if (document.getElementById('cart-items-container')) {
                renderCartItems();
            }
            updateCartIconCount();
        }

        function updateQuantity(itemId, change) {
            const itemToUpdate = cart.find(cartItem => cartItem.id === itemId);
            if (itemToUpdate) {
                itemToUpdate.quantity += change;
                if (itemToUpdate.quantity <= 0) {
                    removeItem(itemId);
                } else {
                    saveCart();
                    if (document.getElementById('cart-items-container')) {
                        renderCartItems();
                    }
                    updateCartIconCount();
                }
            }
        }

        function removeItem(itemId) {
            cart = cart.filter(cartItem => cartItem.id !== itemId);
            saveCart();
            if (document.getElementById('cart-items-container')) {
                renderCartItems();
            }
            updateCartIconCount();
        }

        // --- Cart Rendering and Total Functions (primarily for cart.html) ---
        function renderCartItems() {
            const container = document.getElementById('cart-items-container');
            const emptyMessage = document.getElementById('empty-cart-message');

            if (!container || !emptyMessage) return;

            container.innerHTML = '';
            if (cart.length === 0) {
                emptyMessage.classList.remove('hidden');
            } else {
                emptyMessage.classList.add('hidden');
                cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('flex', 'items-center', 'justify-between', 'border-b', 'border-gray-200', 'pb-4', 'mb-4'); // Added mb-4 for spacing
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

        function calculateCartTotals() {
            const subtotalEl = document.getElementById('subtotal');
            const shippingEl = document.getElementById('shipping');
            const totalEl = document.getElementById('total');

            if (!subtotalEl || !shippingEl || !totalEl) return;

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

        // --- Product Page Add to Cart Function (globally accessible via window) ---
        window.addToCartFromProductPage = function(buttonElement) {
            const item = {
                id: buttonElement.dataset.itemId,
                name: buttonElement.dataset.itemName,
                price: parseFloat(buttonElement.dataset.itemPrice),
                image: buttonElement.dataset.itemImage,
                unit: buttonElement.dataset.itemUnit
            };
            addToCart(item); // Call the core addToCart function
        };

        // --- Main DOMContentLoaded Listener for groceryPage.html ---
        // Ensure this part is at the top of your script.js or wrapped in a DOMContentLoaded listener
        document.addEventListener('DOMContentLoaded', function() {

            // --- Common Cart Count Function ---
            function updateCartCount() {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const cartItemCount = document.getElementById('cart-item-count');
                if (cartItemCount) {
                    // Count distinct items (each unique product ID is one item in the array)
                    cartItemCount.textContent = cart.length;
        
                    // Show/hide the badge based on cart content
                    if (cart.length === 0) {
                        cartItemCount.classList.add('hidden');
                    } else {
                        cartItemCount.classList.remove('hidden');
                    }
                }
            }
        
            // --- Add to Cart Function (for product pages) ---
            window.addToCartFromProductPage = function(buttonElement) {
                const itemId = buttonElement.dataset.itemId;
                const itemName = buttonElement.dataset.itemName;
                const itemPrice = parseFloat(buttonElement.dataset.itemPrice);
                const itemImage = buttonElement.dataset.itemImage;
                const itemUnit = buttonElement.dataset.itemUnit;
        
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
                const existingItemIndex = cart.findIndex(item => item.id === itemId);
        
                if (existingItemIndex > -1) {
                    cart[existingItemIndex].quantity += 1;
                } else {
                    cart.push({
                        id: itemId,
                        name: itemName,
                        price: itemPrice,
                        image: itemImage,
                        unit: itemUnit,
                        quantity: 1
                    });
                }
        
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount(); // Update the navbar count immediately
            };
        
            // --- Cart Page Specific Elements ---
            const cartItemsContainer = document.getElementById('cart-items-container');
            const emptyCartMessage = document.getElementById('empty-cart-message');
            const subtotalElement = document.getElementById('subtotal');
            const shippingElement = document.getElementById('shipping'); // Re-declared and used
            const totalElement = document.getElementById('total');
        
            // --- Render Cart Items Function (displays items on cart.html) ---
            function renderCartItems() {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
                if (cartItemsContainer) { // Only run if on the cart page
                    cartItemsContainer.innerHTML = ''; // Clear existing content
        
                    if (cart.length === 0) {
                        emptyCartMessage.classList.remove('hidden');
                    } else {
                        emptyCartMessage.classList.add('hidden');
                        cart.forEach(item => {
                            const itemElement = document.createElement('div');
                            itemElement.classList.add('flex', 'items-center', 'justify-between', 'p-4', 'bg-gray-50', 'rounded-lg', 'shadow-sm');
                            itemElement.innerHTML = `
                                <div class="flex items-center space-x-4">
                                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded-md">
                                    <div>
                                        <h3 class="text-lg font-open-sans font-semibold text-gray-900">${item.name}</h3>
                                        <p class="text-gray-600 font-open-sans">$${item.price.toFixed(2)} / ${item.unit}</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="flex items-center border border-gray-300 rounded-md">
                                        <button class="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded-l-md" data-item-id="${item.id}" data-action="decrease">-</button>
                                        <span class="px-3 py-1 font-semibold text-gray-800">${item.quantity}</span>
                                        <button class="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded-r-md" data-item-id="${item.id}" data-action="increase">+</button>
                                    </div>
                                    <p class="text-lg font-bold text-gray-900">$${(item.price * item.quantity).toFixed(2)}</p>
                                    <button class="text-red-500 hover:text-red-700" data-item-id="${item.id}" data-action="remove">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            `;
                            cartItemsContainer.appendChild(itemElement);
                        });
                    }
                    updateCartSummary(cart); // Call to update summary after items are rendered
                }
                updateCartCount(); // Always update navbar count on any cart action or page load
            }
        
            // --- Update Cart Summary Function (calculates totals) ---
            function updateCartSummary(cart) {
                if (subtotalElement && shippingElement && totalElement) { // Ensure all elements exist
                    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
                    let shipping; // Declare shipping variable
        
                    // Conditional shipping logic
                    if (subtotal >= 50) { // Using >= to include exactly $50
                        shipping = 0.00; // Free shipping
                    } else {
                        shipping = 2.00; // Standard shipping cost
                    }
        
                    let total = subtotal + shipping;
        
                    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
                    shippingElement.textContent = `$${shipping.toFixed(2)}`; // Set shipping price
                    totalElement.textContent = `$${total.toFixed(2)}`;
                }
            }
        
            // --- Event Delegation for Quantity Change and Remove Buttons (on cart page) ---
            if (cartItemsContainer) {
                cartItemsContainer.addEventListener('click', function(event) {
                    const target = event.target;
                    // Use .closest() to find the button with data-action
                    const button = target.closest('button[data-action]');
        
                    if (!button) return; // Click was not on a relevant button
        
                    const itemId = button.dataset.itemId;
                    const action = button.dataset.action;
        
                    if (!itemId || !action) return;
        
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const itemIndex = cart.findIndex(item => item.id === itemId);
        
                    if (itemIndex > -1) {
                        if (action === 'increase') {
                            cart[itemIndex].quantity++;
                        } else if (action === 'decrease') {
                            cart[itemIndex].quantity--;
                            if (cart[itemIndex].quantity <= 0) {
                                cart.splice(itemIndex, 1); // Remove item if quantity drops to 0 or less
                            }
                        } else if (action === 'remove') {
                            cart.splice(itemIndex, 1); // Remove the item entirely
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        renderCartItems(); // Re-render to reflect changes and update counts/totals
                    }
                });
            }
        
            // --- Initial Render of Cart Items on Cart Page Load ---
            if (cartItemsContainer) {
                renderCartItems();
            }
        
        
            // --- Product Filtering and Search Functionality (for groceryPage) ---
            const groceryPageSearchInput = document.getElementById('groceryPageSearchInput');
            const productItemsContainerGrocery = document.querySelector('.grid.grid-cols-1');
        
            // Store all original product items initially
            const allOriginalProductItems = document.querySelectorAll('.item');
        
            function getItemCategory(itemElement) {
                if (itemElement.classList.contains('fruits')) return 'fruits';
                if (itemElement.classList.contains('vegetable')) return 'vegetable';
                if (itemElement.classList.contains('meats')) return 'meats';
                if (itemElement.classList.contains('snacks')) return 'snacks';
                if (itemElement.classList.contains('drinks')) return 'drinks';
                if (itemElement.classList.contains('bakery')) return 'bakery';
                if (itemElement.classList.contains('spices')) return 'spices';
                return '';
            }
        
            function filterProducts() {
                if (!groceryPageSearchInput || !productItemsContainerGrocery) {
                    return; // Exit if elements are not present (i.e., not on groceryPage)
                }
        
                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                const searchTerm = groceryPageSearchInput.value.toLowerCase().trim();
        
                let itemsToShow = [];
        
                allOriginalProductItems.forEach(item => {
                    const itemCategory = getItemCategory(item);
                    const itemName = item.querySelector('h3').textContent.toLowerCase();
        
                    const matchesSearch = itemName.includes(searchTerm);
                    const matchesCategory = !categoryParam || (itemCategory === categoryParam);
        
                    if (matchesSearch && matchesCategory) {
                        itemsToShow.push(item);
                    }
                });
        
                productItemsContainerGrocery.innerHTML = '';
        
                if (itemsToShow.length > 0) {
                    itemsToShow.forEach(item => {
                        productItemsContainerGrocery.appendChild(item);
                    });
                } else {
                    productItemsContainerGrocery.innerHTML = `
                        <p class="text-center text-gray-500 text-lg w-full col-span-full">No products found matching your criteria.</p>
                    `;
                }
            }
        
            if (groceryPageSearchInput) {
                groceryPageSearchInput.addEventListener('input', filterProducts);
            }
        
            // Initial filter when the groceryPage loads (to apply category from URL)
            if (window.location.pathname.includes('groceryPage.html') || window.location.pathname === '/') {
                filterProducts();
            }
            // --- END Product Filtering and Search Functionality ---
        
            // Ensure cart count is updated on ALL page loads for the navbar icon
            updateCartCount();
        });