# CedoDev | Portfólio

[![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

Landing page de portfólio pessoal do desenvolvedor Kauan Macedo, apresentando skills, projetos e jornada profissional.

## 🚀 Sobre o Projeto

Este é um portfólio web responsivo desenvolvido para apresentar as habilidades, projetos e experiências de um desenvolvedor. O site conta com design moderno e interativo, otimizado para diferentes dispositivos.

## ✨ Funcionalidades

- **Design Responsivo**: Adaptado para desktop, tablet e mobile
- **Interface Moderna**: Design clean e profissional
- **Seções Organizadas**: 
  - Apresentação pessoal
  - Habilidades técnicas
  - Portfólio de projetos
  - Informações de contato
- **Animações Suaves**: Transições e efeitos visuais
- **SEO Otimizado**: Meta tags e estrutura semântica
- **Deploy Automático**: CI/CD integrado com Azure Static Web Apps
- **Preview de PRs**: Ambientes de teste para pull requests

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização avançada com flexbox/grid
- **JavaScript**: Interatividade e funcionalidades dinâmicas
- **Google Fonts**: Tipografia (Inter e Kanit)
- **BoxIcons**: Ícones vetoriais
- **Azure Static Web Apps**: Hospedagem e CI/CD
- **GitHub Actions**: Pipeline de deploy automático

## 📱 Responsividade

O projeto foi desenvolvido com abordagem mobile-first, garantindo uma experiência otimizada em:
- 📱 Smartphones
- 📟 Tablets
- 💻 Desktops
- 🖥️ Monitores grandes

## 🚀 Como Executar

### Executar Localmente

1. Clone este repositório:
```bash
git clone https://github.com/ogkauann/cedodev.git
```

2. Navegue até o diretório:
```bash
cd cedodev
```

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (live-server)
npx live-server
```

### Deploy no Azure Static Web Apps

Este projeto está configurado para deploy automático no Azure Static Web Apps através do GitHub Actions.

**Pré-requisitos:**
- Conta no [Azure](https://azure.microsoft.com/)
- Repositório conectado ao GitHub

**Passos para configurar:**

1. **Criar Static Web App no Azure:**
   ```bash
   # Instalar Azure CLI
   winget install Microsoft.AzureCLI
   
   # Login no Azure
   az login
   
   # Criar resource group
   az group create --name rg-cedodev --location "East US"
   
   # Criar Static Web App
   az staticwebapp create \
     --name cedodev-portfolio \
     --resource-group rg-cedodev \
     --source https://github.com/ogkauann/cedodev \
     --location "East US" \
     --branch main \
     --app-location "/" \
     --output-location ""
   ```

2. **Configurar Secret no GitHub:**
   - Vá em: Repositório → Settings → Secrets and variables → Actions
   - Adicione: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Valor: Token obtido no portal do Azure

3. **Deploy Automático:**
   - Cada push na branch `main` fará deploy automático
   - Pull requests criam ambientes de preview
   - URL será fornecida após o primeiro deploy

## 📁 Estrutura do Projeto

```
cedodev/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps-ci-cd.yml  # CI/CD pipeline
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidades JavaScript
├── favicon.svg         # Ícone do site
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Documentação do projeto
```

## 🎨 Customização

Para personalizar o portfólio:

1. **Informações Pessoais**: Edite o conteúdo HTML em `index.html`
2. **Estilos**: Modifique as cores e layout em `styles.css`
3. **Funcionalidades**: Adicione interações em `script.js`
4. **Ícone**: Substitua o `favicon.svg`

## 📈 Melhorias Futuras

- [ ] Sistema de blog integrado
- [ ] Formulário de contato funcional
- [ ] Modo escuro/claro
- [ ] Animações mais avançadas
- [ ] Integração com CMS
- [ ] PWA (Progressive Web App)

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request


## 📧 Contato

**Kauan Macedo** - CedoDev

- GitHub: [@ogkauann](https://github.com/ogkauann)
- LinkedIn: [kauan-macedo](https://linkedin.com/in/kauan-macedo-363ba631b/)
- Email: comercial.ogkauann@gmail.com

---

⭐ Se este projeto te ajudou, não esqueça de dar uma estrela!
