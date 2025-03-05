import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';

interface Route {
    path: string;
    component: string;
}


class RouterOutlet extends LitElement {
    @property({type: String}) currentRoute: string = window.location.pathname;

    static routes: Route[] = [
        {path: '/', component: 'home-component'},
        {path: '/catcrime', component: 'catcrime-component'},

    ];

    constructor() {
        super();
        this.setupInitialRoute();
        window.addEventListener('popstate', () => {
            this.currentRoute = window.location.pathname;
            this.requestUpdate();
        });
    }


    private setupInitialRoute() {
        const initialPath = window.location.pathname;
        const route = RouterOutlet.routes.find(r => r.path === initialPath);

        if (!route) {
            this.navigate('/'); // Zurück zur Startseite, wenn Route nicht existiert
        } else {
            this.currentRoute = initialPath; // Korrekte Initialroute setzen
        }
    }

    navigate(path: string) {
        if (this.currentRoute !== path) {
            window.history.pushState({}, '', path);
            this.currentRoute = path;
            this.requestUpdate();
        }

        // Scrollen auf den Anfang der Seite, falls gewünscht
        window.scrollTo(0, 0);
    }

    private onNavigate(event: Event) {
        event.preventDefault();
        const target = event.target as HTMLElement;

        // Suche den `href`-Link in A-Tag oder Parent-Nodes
        const link = target.closest('a');
        const path = link?.getAttribute('href');

        if (path) {
            this.navigate(path);
        }
    }

    render() {
        const route = RouterOutlet.routes.find(r => r.path === this.currentRoute);
        const ComponentTag = route ? route.component : 'not-found-component';

        return html`
            <nav @click=${this.onNavigate}>
                <a href="/">Home</a>
                <a href="/catcrime">game</a>
            </nav>
            <div id="outlet"></div>
        `;
    }

    updated() {
        const outlet = this.shadowRoot?.querySelector('#outlet');
        if (outlet) {
            outlet.innerHTML = '';

            const route = RouterOutlet.routes.find(r => r.path === this.currentRoute);
            const ComponentTag = route ? route.component : 'not-found-component';

            if (!customElements.get(ComponentTag)) {
                import(`./components/${ComponentTag}`)
                    .then(() => {
                        const element = document.createElement(ComponentTag);
                        outlet.appendChild(element);
                    })
                    .catch(err => console.error(`Failed to load component ${ComponentTag}`, err));
            } else {
                const element = document.createElement(ComponentTag);
                outlet.appendChild(element);
            }
        }
    }
}

customElements.define('router-outlet', RouterOutlet);
