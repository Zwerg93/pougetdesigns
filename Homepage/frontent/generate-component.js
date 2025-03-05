const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];

if (!componentName) {
    console.error('Usage: npm run generate <componentName>');
    process.exit(1);
}

const componentFolderPath = path.join(__dirname, 'src', 'app', 'components', componentName);

try {
    // Erstelle den Ordner für die Komponente
    fs.mkdirSync(componentFolderPath +  "-component");

    // Erstelle die Dateien in der Komponente
    const indexContent = `import "./${componentName}-component";`;
    fs.writeFileSync(path.join(componentFolderPath +  "-component", 'index.ts'), indexContent);

    const cssContent = `/* Styles for ${componentName} component */`;
    fs.writeFileSync(path.join(componentFolderPath +  "-component", 'style.css'), cssContent);

    const componentContent = `
    import { html, render } from "lit-html";
    import style from './style.css'
    
    const template = html\`
        <div class="${componentName}">
            <!-- Content -->
        </div>
    \`;
    
    class ${capitalizeFirstLetter(componentName)} extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({mode: "open"});
        }
        connectedCallback() {
            this.render();
        }
        private render() {
            const styleTag = document.createElement('style');
            styleTag.textContent = style; // Hier wird der CSS-Inhalt eingefügt
            this.shadowRoot.appendChild(styleTag);
            
            render(template, this.shadowRoot);
        }
    }
    customElements.define("${componentName}-component", ${capitalizeFirstLetter(componentName)});
    `;

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    fs.writeFileSync(path.join(componentFolderPath +  "-component", `${componentName}-component.ts`), componentContent);

    console.log(`${componentName} was generated successfully.`);
} catch (error) {
    console.error('Error generating the component:', error);
}
