function createProductCardElement(product) {
    const template = document.querySelector('template[data-type="products-template"]');
    const cardCopy = document.importNode(template.content, true);

    const imageElement = cardCopy.querySelector('[data-type="image"] img');
    imageElement.src = product.images[0].replace(/\[|\]/g, '');
    imageElement.onerror = function() {
        this.src = 'https://placehold.co/600x400?text=Placeholder';
    };

    cardCopy.querySelector('[data-type="title"]').innerText = product.title;

    const priceElement = cardCopy.querySelector('[data-type="price"]');
    priceElement.innerText = `$ ${product.price}`;

    const descriptionElement = cardCopy.querySelector('[data-type="short-description"]');
    const maxDescriptionLength = 25;
    if (product.description.length > maxDescriptionLength) {
        descriptionElement.innerText = `${product.description.slice(0, maxDescriptionLength)} ... Read more`;
        descriptionElement.style.cursor = 'pointer';

        let descriptionVisible = false;
        descriptionElement.addEventListener('click', () => {
            if (descriptionVisible) {
                descriptionElement.innerText = `${product.description.slice(0, maxDescriptionLength)} ... Read more`;
            } else {
                descriptionElement.innerText = product.description;
            }

            descriptionVisible = !descriptionVisible;
        });
    } else {
        descriptionElement.innerText = product.description;
    }

    const likeButton = cardCopy.querySelector('[data-type="button"]');
    likeButton.addEventListener('click', () => {
        const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
        const productId = product.id;

        if (likedProducts.includes(productId)) {
            likedProducts.splice(likedProducts.indexOf(productId), 1);
            likeButton.classList.remove('liked');
            likeButton.textContent = 'Like'
        } else {
            likedProducts.push(productId);
            likeButton.classList.add('liked');
            likeButton.textContent = 'Liked'
        }

        localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
    });

    const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    if (likedProducts.includes(product.id)) {
        likeButton.classList.add('liked');
        likeButton.textContent = 'Liked'
    }

    return cardCopy;
}

async function fetchProducts(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': '',
                'Content-Type': 'application/json',
                'mode': 'cors',
                'cache': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function renderProducts(container, url) {
    const spinnerContainer = document.querySelector('[data-type="spinner-container"]');
    spinnerContainer.style.display = 'block';

    try {
        const products = await fetchProducts(url);

        container.innerHTML = '';

        products.forEach((product) => {
            const productElement = createProductCardElement(product);
            container.appendChild(productElement);
        });

        renderLikedProducts();
    } catch (error) {
        console.error('Error rendering products:', error);
    } finally {
        spinnerContainer.style.display = 'none';
    }
}

function renderLikedProducts() {
    const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    const productsContainer = document.querySelector('[data-type="products-list"]');
    const likedProductsContainer = document.querySelector('[data-type="liked-products"]');
    
    likedProductsContainer.innerHTML = '';

    likedProducts.forEach(async (productId) => {
        try {
            const product = await fetchProductById(productId);
            const productElement = createProductCardElement(product);
            likedProductsContainer.appendChild(productElement);
        } catch (error) {
            console.error('Error rendering liked product:', error);
        }
    });
}

async function fetchProductById(productId) {
    const response = await fetch(`${apiUrl}/${productId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product by ID');
    }
    return await response.json();
}

const apiUrl = 'https://api.escuelajs.co/api/v1/products';
const productsContainer = document.querySelector('[data-type="products-list"]');

window.addEventListener('load', () => {
    renderProducts(productsContainer, apiUrl);
});
