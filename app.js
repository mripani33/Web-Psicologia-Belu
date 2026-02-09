// Backend Simulation using localStorage
class BackendAPI {
    constructor() {
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem('blog_posts')) {
            localStorage.setItem('blog_posts', JSON.stringify([]));
        }
        if (!localStorage.getItem('resources')) {
            localStorage.setItem('resources', JSON.stringify([]));
        }
        if (!localStorage.getItem('site_config')) {
            const defaultConfig = {
                name: 'Dra. [Nombre Apellido]',
                email: 'contacto@ejemplo.com',
                whatsapp: '34XXXXXXXXX',
                calendly: 'https://calendly.com/tu-usuario',
                colegiacion: 'XXXXX'
            };
            localStorage.setItem('site_config', JSON.stringify(defaultConfig));
        }
    }

    // Blog Methods
    getBlogPosts() {
        return JSON.parse(localStorage.getItem('blog_posts')) || [];
    }

    addBlogPost(post) {
        const posts = this.getBlogPosts();
        post.id = Date.now();
        post.date = new Date().toLocaleDateString('es-ES');
        posts.unshift(post);
        localStorage.setItem('blog_posts', JSON.stringify(posts));
        return post;
    }

    updateBlogPost(id, updatedPost) {
        const posts = this.getBlogPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedPost };
            localStorage.setItem('blog_posts', JSON.stringify(posts));
            return posts[index];
        }
        return null;
    }

    deleteBlogPost(id) {
        const posts = this.getBlogPosts();
        const filtered = posts.filter(p => p.id !== id);
        localStorage.setItem('blog_posts', JSON.stringify(filtered));
    }

    // Resources Methods
    getResources() {
        return JSON.parse(localStorage.getItem('resources')) || [];
    }

    addResource(resource) {
        const resources = this.getResources();
        resource.id = Date.now();
        resources.unshift(resource);
        localStorage.setItem('resources', JSON.stringify(resources));
        return resource;
    }

    deleteResource(id) {
        const resources = this.getResources();
        const filtered = resources.filter(r => r.id !== id);
        localStorage.setItem('resources', JSON.stringify(filtered));
    }

    // Config Methods
    getConfig() {
        return JSON.parse(localStorage.getItem('site_config'));
    }

    updateConfig(config) {
        localStorage.setItem('site_config', JSON.stringify(config));
        return config;
    }
}

// Initialize Backend API
const api = new BackendAPI();

// UI Controller
class UIController {
    constructor() {
        this.initializeEventListeners();
        this.loadContent();
        this.applyConfiguration();
    }

    initializeEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    navLinks.classList.remove('active');
                }
            });
        });

        // Admin modal
        const adminBtn = document.getElementById('admin-access');
        const modal = document.getElementById('admin-modal');
        const closeBtn = document.querySelector('.modal-close');

        adminBtn.addEventListener('click', () => {
            modal.classList.add('active');
            this.loadAdminContent();
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Blog form
        document.getElementById('blog-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBlogSubmit();
        });

        // Resource form
        document.getElementById('resource-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResourceSubmit();
        });

        // Config form
        document.getElementById('config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConfigSubmit();
        });
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    loadContent() {
        this.renderBlogPosts();
        this.renderResources();
    }

    applyConfiguration() {
        const config = api.getConfig();
        
        // Update navigation logo
        document.querySelector('.nav-logo').textContent = config.name;
        
        // Update hero
        document.querySelector('.hero-title').textContent = 
            document.querySelector('.hero-title').textContent;
        
        // Update footer
        document.querySelector('.footer-section h4').textContent = config.name;
        
        // Update contact info
        const emailLink = document.querySelector('.contact-method a[href^="mailto"]');
        if (emailLink) {
            emailLink.href = `mailto:${config.email}`;
            emailLink.textContent = config.email;
        }
        
        const whatsappLink = document.querySelector('.contact-method a[href^="https://wa.me"]');
        if (whatsappLink) {
            whatsappLink.href = `https://wa.me/${config.whatsapp}`;
        }
        
        // Update WhatsApp floating button
        const whatsappFloat = document.querySelector('.whatsapp-float');
        if (whatsappFloat) {
            whatsappFloat.href = `https://wa.me/${config.whatsapp}`;
        }
        
        // Update Calendly
        const calendlyWidget = document.querySelector('.calendly-inline-widget');
        if (calendlyWidget) {
            calendlyWidget.setAttribute('data-url', config.calendly);
        }
    }

    renderBlogPosts() {
        const posts = api.getBlogPosts();
        const blogGrid = document.getElementById('blog-grid');
        
        if (posts.length === 0) {
            blogGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">
                    <p>No hay artículos publicados todavía. Usa el panel de administración para agregar contenido.</p>
                </div>
            `;
            return;
        }

        blogGrid.innerHTML = posts.map(post => `
            <article class="blog-card">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width: 100%; height: 240px; object-fit: cover;">` : '<div class="blog-image-placeholder"></div>'}
                <div class="blog-content">
                    <span class="blog-date">${post.date}</span>
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 150)}...</p>
                    <a href="#" class="blog-link" onclick="event.preventDefault(); alert('Artículo completo: ${post.title}\\n\\n${post.content}')">Leer más →</a>
                </div>
            </article>
        `).join('');
    }

    renderResources() {
        const resources = api.getResources();
        const resourcesGrid = document.getElementById('resources-grid');
        
        if (resources.length === 0) {
            resourcesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">
                    <p>No hay recursos disponibles todavía. Usa el panel de administración para agregar material.</p>
                </div>
            `;
            return;
        }

        const iconMap = {
            pdf: '📄',
            audio: '🎵',
            video: '🎬'
        };

        resourcesGrid.innerHTML = resources.map(resource => `
            <div class="resource-card">
                <div class="resource-icon">${iconMap[resource.type] || '📄'}</div>
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <a href="${resource.file}" class="resource-download" download>Descargar ${resource.type.toUpperCase()}</a>
            </div>
        `).join('');
    }

    loadAdminContent() {
        this.renderAdminBlogList();
        this.renderAdminResourceList();
        this.loadConfigForm();
    }

    renderAdminBlogList() {
        const posts = api.getBlogPosts();
        const blogList = document.getElementById('blog-list');
        
        if (posts.length === 0) {
            blogList.innerHTML = '<p style="color: var(--text-light); padding: 20px;">No hay artículos publicados.</p>';
            return;
        }

        blogList.innerHTML = posts.map(post => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h4>${post.title}</h4>
                    <p>${post.date}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="edit-btn" onclick="ui.editBlogPost(${post.id})">Editar</button>
                    <button class="delete-btn" onclick="ui.deleteBlogPost(${post.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    renderAdminResourceList() {
        const resources = api.getResources();
        const resourceList = document.getElementById('resource-list');
        
        if (resources.length === 0) {
            resourceList.innerHTML = '<p style="color: var(--text-light); padding: 20px;">No hay recursos publicados.</p>';
            return;
        }

        resourceList.innerHTML = resources.map(resource => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h4>${resource.title}</h4>
                    <p>${resource.type.toUpperCase()}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="delete-btn" onclick="ui.deleteResource(${resource.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    loadConfigForm() {
        const config = api.getConfig();
        document.getElementById('config-name').value = config.name;
        document.getElementById('config-email').value = config.email;
        document.getElementById('config-whatsapp').value = config.whatsapp;
        document.getElementById('config-calendly').value = config.calendly;
        document.getElementById('config-colegiacion').value = config.colegiacion;
    }

    handleBlogSubmit() {
        const id = document.getElementById('blog-id').value;
        const title = document.getElementById('blog-title').value;
        const image = document.getElementById('blog-image').value;
        const content = document.getElementById('blog-content').value;

        const post = { title, image, content };

        if (id) {
            api.updateBlogPost(parseInt(id), post);
        } else {
            api.addBlogPost(post);
        }

        // Reset form
        document.getElementById('blog-form').reset();
        document.getElementById('blog-id').value = '';

        // Update displays
        this.renderBlogPosts();
        this.renderAdminBlogList();
        
        alert('Artículo publicado exitosamente');
    }

    editBlogPost(id) {
        const posts = api.getBlogPosts();
        const post = posts.find(p => p.id === id);
        
        if (post) {
            document.getElementById('blog-id').value = post.id;
            document.getElementById('blog-title').value = post.title;
            document.getElementById('blog-image').value = post.image || '';
            document.getElementById('blog-content').value = post.content;
            
            // Scroll to form
            document.getElementById('blog-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    deleteBlogPost(id) {
        if (confirm('¿Estás segura de que quieres eliminar este artículo?')) {
            api.deleteBlogPost(id);
            this.renderBlogPosts();
            this.renderAdminBlogList();
        }
    }

    handleResourceSubmit() {
        const title = document.getElementById('resource-title').value;
        const description = document.getElementById('resource-description').value;
        const file = document.getElementById('resource-file').value;
        const type = document.getElementById('resource-type').value;

        const resource = { title, description, file, type };
        api.addResource(resource);

        // Reset form
        document.getElementById('resource-form').reset();

        // Update displays
        this.renderResources();
        this.renderAdminResourceList();
        
        alert('Recurso agregado exitosamente');
    }

    deleteResource(id) {
        if (confirm('¿Estás segura de que quieres eliminar este recurso?')) {
            api.deleteResource(id);
            this.renderResources();
            this.renderAdminResourceList();
        }
    }

    handleConfigSubmit() {
        const config = {
            name: document.getElementById('config-name').value,
            email: document.getElementById('config-email').value,
            whatsapp: document.getElementById('config-whatsapp').value,
            calendly: document.getElementById('config-calendly').value,
            colegiacion: document.getElementById('config-colegiacion').value
        };

        api.updateConfig(config);
        this.applyConfiguration();
        
        alert('Configuración guardada exitosamente. Recarga la página para ver todos los cambios.');
    }
}

// Initialize UI Controller
const ui = new UIController();

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Animate sections on scroll
    const sections = document.querySelectorAll('.service-card, .resource-card, .blog-card');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
