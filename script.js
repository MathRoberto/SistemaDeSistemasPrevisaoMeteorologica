const btn = document.getElementById('btn-verificar');
const resultado = document.getElementById('resultado');

const apiKey = 'dc9622e76c7ae551aaa95734ef641e14';

// Pedir permissão logo ao carregar
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

// Sistema de Notificação
function enviarNotificacao(mensagem) {
  if (Notification.permission === 'granted') {
    new Notification('Alerta do Clima', {
      body: mensagem,
      icon: 'https://cdn-icons-png.flaticon.com/512/1116/1116453.png'
    });
  }
}

// Sistema de Clima
async function obterClima(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Sistema de Geolocalização
function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        }),
        err => reject(err)
      );
    } else {
      reject('Geolocalização não suportada');
    }
  });
}

// Evento de clique no botão
btn.addEventListener('click', async () => {
  resultado.textContent = 'Obtendo localização...';

  try {
    const localizacao = await obterLocalizacao();
    resultado.textContent = 'Obtendo clima...';

    const clima = await obterClima(localizacao.lat, localizacao.lon);

    if (clima.weather && clima.weather.length > 0) {
      const descricao = clima.weather[0].description;
      const temperatura = clima.main.temp;

      resultado.innerHTML = `
        Local: ${clima.name}<br>
        Clima: ${descricao}<br>
        Temperatura: ${temperatura} °C
      `;

      // Sempre envia notificação com clima e temperatura
      let mensagem = `Clima: ${descricao}, ${temperatura} °C`;

      // Se temperatura for maior que 35°C, adiciona alerta
      if (temperatura > 35) {
        mensagem = `⚠️ ALERTA DE CALOR! ${mensagem}`;
      }

      enviarNotificacao(mensagem);

      // Exibe o mapa
      const mapDiv = document.getElementById('map');
      mapDiv.style.display = 'block';

      // Remove mapa anterior, se tiver
      if (mapDiv._leaflet_id) {
        mapDiv._leaflet_id = null;
        mapDiv.innerHTML = "";
      }

      // Cria o mapa com Leaflet
      const map = L.map('map').setView([localizacao.lat, localizacao.lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([localizacao.lat, localizacao.lon]).addTo(map)
        .bindPopup(`${clima.name}`)
        .openPopup();

    } else {
      resultado.innerHTML = `Erro na resposta da API: ${clima.message || 'Resposta inesperada'}`;
    }

  } catch (error) {
    resultado.textContent = `Erro: ${error.message || error}`;
  }
});
