import {html, render} from 'lit-html';
        import './router-outlet';
        
        class AppComponent extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({mode: 'open'});
            }
        
            connectedCallback() {
                const template = html`<router-outlet></router-outlet>`;
                render(template, this.shadowRoot!);
            }
        }
        
        customElements.define('app-component', AppComponent);
        