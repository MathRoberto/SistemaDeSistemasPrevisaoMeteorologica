
# 🌦️ Sistema de Monitoramento Climático

Este projeto é um Sistema de Sistemas (SoS) desenvolvido para fins acadêmicos, que integra diferentes APIs e tecnologias do navegador para fornecer informações climáticas em tempo real com base na localização do usuário.

> Projeto desenvolvido por **Matheus Roberto Barcellos Ferraz** como parte da disciplina de **Sistemas de Sistemas** — UniAcademia.

---

## ✨ Funcionalidades

- 📍 Detecta a **localização atual** do usuário  
- 🌡️ Exibe **clima atual** com ícone, temperatura, umidade, pressão e vento  
- ☀️ Mostra **horário de nascer e pôr do sol**  
- 🧥 Sugere **roupas apropriadas**  
- 🚴 Recomenda **atividades** com base no clima  
- 🌧️ Apresenta **probabilidade de chuva**  
- 🗓️ Previsão detalhada para **amanhã**  
- 💨 Informa a **qualidade do ar (AQI)**  
- ⚠️ Alerta meteorológico com **notificações nativas**  
- 🗺️ Exibe **mapa com localização** via Leaflet  

---

## 🧪 Tecnologias utilizadas

- HTML5 + CSS3 (responsivo)  
- JavaScript puro (sem frameworks)  
- [OpenWeather API](https://openweathermap.org/)  
- [Leaflet.js](https://leafletjs.com/) para mapa  
- Web Notifications API  
- Geolocation API (do navegador)  

---

## 🚀 Como usar

1. Clone o repositório:

```bash
git clone https://github.com/MathRoberto/SistemaDeSistemasPrevisaoMeteorologica
cd SistemaDeSistemasPrevisaoMeteorologica
```

2. Crie um arquivo `config.js` na raiz do projeto com sua chave da OpenWeather:

```js
// config.js
const CONFIG = {
  API_KEY: 'SUA_API_KEY_AQUI'
};
```

> **⚠️ Dica:** nunca suba `config.js` ao GitHub. Use `.gitignore`.

3. Abra o arquivo `index.html` no navegador.

---

## 📁 Estrutura do projeto

```
├── index.html
├── style.css
├── script.js
├── config.example.js
├── .gitignore
└── README.md
```

---

## 📄 Licença

Este projeto é de uso acadêmico e educacional. Você pode adaptá-lo livremente, mas sempre mantenha os créditos.

---

## 📬 Contato

[![GitHub](https://img.shields.io/badge/GitHub-MathRoberto-181717?style=for-the-badge&logo=github)](https://github.com/MathRoberto)
