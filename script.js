class App {
    constructor() {
        this.baseUrl = 'https://jsonplaceholder.typicode.com/posts';
        this.limit = 10;

        this.page = 1;
        this.query = '';
        this.loading = false;
        this.hasMore = true;

        this.posts = document.getElementById('posts');
        this.loader = document.getElementById('loader');
        this.error = document.getElementById('error');
        this.empty = document.getElementById('empty');
        this.search = document.getElementById('search');
        this.loadMoreBtn = document.getElementById('loadMore');
        this.sentinel = document.getElementById('sentinel');

        this.init();
    }

    init() {
        this.search.addEventListener('input', this.debounce((e) => {
            this.query = e.target.value.trim();
            this.page = 1;
            this.hasMore = true;

            this.posts.innerHTML = '';
            this.loadPosts();
        }, 300));

        this.loadMoreBtn.addEventListener('click', () => {
            this.loadPosts();
        });

        this.createObserver();

        this.loadPosts();
    }

    debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    async loadPosts() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;
        this.showLoader();
        this.hideError();
        this.hideEmpty();

        try {
            let url = `${this.baseUrl}?_page=${this.page}&_limit=${this.limit}`;

            if (this.query) {
                url += `&title_like=${this.query}`;
            }

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error('Ошибка загрузки');
            }

            const data = await res.json();

            if (data.length === 0) {
                if (this.page === 1) {
                    this.showEmpty();
                }
                this.hasMore = false;
                this.loadMoreBtn.disabled = true;
                return;
            }

            this.render(data);
            this.page++;

        } catch (e) {
            this.showError(e.message);
        } finally {
            this.loading = false;
            this.hideLoader();
        }
    }

    render(data) {
        let i = 0;

        while (i < data.length) {
            const post = data[i];

            const div = document.createElement('div');
            div.className = 'post';

            const title = document.createElement('h3');
            title.textContent = post.title;

            const body = document.createElement('p');
            body.textContent = post.body;

            div.appendChild(title);
            div.appendChild(body);

            this.posts.appendChild(div);

            i++;
        }
    }

    createObserver() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.loadPosts();
            }
        });

        observer.observe(this.sentinel);
    }

    showLoader() {
        this.loader.classList.remove('hidden');
    }

    hideLoader() {
        this.loader.classList.add('hidden');
    }

    showError(text) {
        this.error.textContent = text;
        this.error.classList.remove('hidden');
    }

    hideError() {
        this.error.classList.add('hidden');
    }

    showEmpty() {
        this.empty.classList.remove('hidden');
    }

    hideEmpty() {
        this.empty.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});