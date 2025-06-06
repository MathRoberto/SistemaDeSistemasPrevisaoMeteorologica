const btn = document.getElementById('btn-verificar');
const resultado = document.getElementById('resultado');
const previsaoDiv = document.getElementById('previsao');
const previsaoAmanhaDiv = document.getElementById('previsao-amanha');
const atividadeDiv = document.getElementById('atividade');
const qualidadeArDiv = document.getElementById('qualidade-ar');
const alertasDiv = document.getElementById('alertas');
const mapDiv = document.getElementById('map');
const loadingOverlay = document.getElementById('loading-overlay');

const apiKey = 'dc9622e76c7ae551aaa95734ef641e14';

// Pedir permissão ao carregar
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

// Notificação
function enviarNotificacao(mensagem) {
  if (Notification.permission === 'granted') {
    new Notification('Alerta do Clima', {
      body: mensagem,
      icon: 'https://cdn-icons-png.flaticon.com/512/1116/1116453.png'
    });
  }
}

// APIs
async function obterClima(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;
  const response = await fetch(url);
  return await response.json();
}

async function obterPrevisao(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=pt_br&units=metric`;
  const response = await fetch(url);
  return await response.json();
}

async function obterQualidadeAr(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const response = await fetch(url);
  return await response.json();
}

// Localização
function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => reject(err)
      );
    } else {
      reject('Geolocalização não suportada');
    }
  });
}

// Lógicas
function recomendarRoupa(temperatura, descricao) {
  if (descricao.includes('chuva')) {
    return "Leve um guarda-chuva.";
  } else if (temperatura > 30) {
    return "Use roupas leves e mantenha-se hidratado.";
  } else if (temperatura < 18) {
    return "Vista um casaco.";
  } else {
    return "Roupas confortáveis são suficientes.";
  }
}

function sugerirAtividade(descricao) {
  if (descricao.includes('chuva') || descricao.includes('nublado')) {
    return "Melhor fazer atividades indoor.";
  } else {
    return "Ótimo dia para atividades ao ar livre!";
  }
}

function interpretarQualidadeAr(aqi) {
  const niveis = ["Bom", "Justo", "Moderado", "Ruim", "Muito Ruim"];
  return niveis[aqi - 1] || "Desconhecido";
}

function obterPrevisaoAmanha(previsao) {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const dia = amanha.getDate();
  const mes = amanha.getMonth();
  const ano = amanha.getFullYear();

  const lista = previsao.list.filter(item => {
    const data = new Date(item.dt * 1000);
    return data.getDate() === dia && data.getMonth() === mes && data.getFullYear() === ano;
  });

  if (lista.length === 0) return "Sem dados disponíveis para amanhã.";

  const max = Math.max(...lista.map(i => i.main.temp_max));
  const min = Math.min(...lista.map(i => i.main.temp_min));
  const desc = lista[0].weather[0].description;

  return `Clima: ${desc}. Temperatura entre ${min.toFixed(1)}°C e ${max.toFixed(1)}°C.`;
}

// Controle do mapa
let map = null;
let marker = null;

function mostrarMapa(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    map.setView([lat, lon], 12);
  }

  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    marker = L.marker([lat, lon]).addTo(map);
  }
}

// Evento do botão
btn.addEventListener('click', async () => {
  loadingOverlay.classList.remove('hidden');

  resultado.textContent = '';
  previsaoDiv.textContent = '';
  previsaoAmanhaDiv.textContent = '';
  atividadeDiv.textContent = '';
  qualidadeArDiv.textContent = '';
  alertasDiv.textContent = '';
  mapDiv.classList.remove('active');

  try {
    const localizacao = await obterLocalizacao();

    const clima = await obterClima(localizacao.lat, localizacao.lon);
    const previsao = await obterPrevisao(localizacao.lat, localizacao.lon);
    const qualidadeAr = await obterQualidadeAr(localizacao.lat, localizacao.lon);

    if (clima.weather && clima.weather.length > 0) {
      // Dados do clima atual
      const temp = clima.main.temp.toFixed(1);
      const desc = clima.weather[0].description;
      const hum = clima.main.humidity;
      const vento = (clima.wind.speed * 3.6).toFixed(1);
      const pressao = clima.main.pressure;

      // === Alterações aqui ===
      resultado.innerHTML = `
        <strong>🌡️ Clima Atual:</strong><br>
        <strong>Temperatura:</strong> ${temp} °C<br>
        <strong>Clima:</strong> ${desc}<br>
        <strong>Umidade:</strong> ${hum}%<br>
        <strong>Vento:</strong> ${vento} km/h<br>
        <strong>Pressão:</strong> ${pressao} hPa
      `;

      const resumoHoje = previsao.list[0].weather[0].description;
      previsaoDiv.innerHTML = `<strong>🕒 Previsão para Hoje:</strong><br>${resumoHoje}`;

      const textoPrevisaoAmanha = obterPrevisaoAmanha(previsao);
      previsaoAmanhaDiv.innerHTML = `<strong>🗓️ Previsão para Amanhã:</strong><br>${textoPrevisaoAmanha}`;

      const recomendacao = recomendarRoupa(clima.main.temp, desc);
      atividadeDiv.innerHTML = `<strong>👕 Recomendações:</strong><br>${recomendacao}`;

      const qualidade = interpretarQualidadeAr(qualidadeAr.list[0].main.aqi);
      qualidadeArDiv.innerHTML = `<strong>💨 Qualidade do Ar:</strong><br>${qualidade}`;

      if (previsao.city && previsao.city.alerts && previsao.city.alerts.length > 0) {
        const textoAlertas = previsao.city.alerts.map(a => a.description).join('<br>');
        alertasDiv.innerHTML = `<strong>⚠️ Alertas:</strong><br>${textoAlertas}`;
        enviarNotificacao(previsao.city.alerts.map(a => a.description).join('\n'));
      } else {
        alertasDiv.innerHTML = `<strong>⚠️ Alertas:</strong><br>Nenhum alerta climático.`;
      }
      // === Fim das alterações ===

      mapDiv.classList.add('active');
      mostrarMapa(localizacao.lat, localizacao.lon);

    } else {
      resultado.textContent = `Erro na resposta da API: ${clima.message || 'Resposta inesperada'}`;
    }
  } catch (error) {
    resultado.textContent = `Erro: ${error.message || error}`;
  } finally {
    loadingOverlay.classList.add('hidden');
  }
});