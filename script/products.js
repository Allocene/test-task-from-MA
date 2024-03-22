function createProductCardElement(product) {
    const template = document.querySelector('template[data-type="products-template"]');
    const cardCopy = document.importNode(template.content, true);

    const imageElement = cardCopy.querySelector('[data-type="image"] img');
    imageElement.src = product.images[0];
    console.log(imageElement);

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

    return cardCopy;
}

async function fetchProducts(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

const apiUrl = 'https://api.escuelajs.co/api/v1/products';

const productsContainer = document.querySelector('[data-type="products-list"]');

async function renderProducts(container, url) {
    const products = await fetchProducts(url);

    container.innerHTML = '';

    products.forEach((product) => {
        const productElement = createProductCardElement(product);
        container.appendChild(productElement);
    });
}

renderProducts(productsContainer, apiUrl);
