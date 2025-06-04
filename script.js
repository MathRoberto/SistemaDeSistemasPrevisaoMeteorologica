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

      if (descricao.includes('chuva') || temperatura > 35) {
        enviarNotificacao(`Alerta: ${descricao}, ${temperatura} °C`);
      }
    } else {
      resultado.innerHTML = `Erro na resposta da API: ${clima.message || 'Resposta inesperada'}`;
    }
    
  } catch (error) {
    resultado.textContent = `Erro: ${error.message || error}`;
  }
});
