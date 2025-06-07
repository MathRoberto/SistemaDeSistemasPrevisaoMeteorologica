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

  // Filtrar previsões para amanhã
  const listaAmanha = previsao.list.filter(item => {
    const data = new Date(item.dt * 1000);
    return data.getDate() === dia && data.getMonth() === mes && data.getFullYear() === ano;
  });

  if (listaAmanha.length === 0) return "Sem dados disponíveis para amanhã.";

  // Calcular dados de amanhã
  const temperaturas = listaAmanha.map(item => item.main.temp);
  const umidades = listaAmanha.map(item => item.main.humidity);
  const velocidadesVento = listaAmanha.map(item => item.wind.speed);
  const pressoes = listaAmanha.map(item => item.main.pressure);

  const avgTemp = temperaturas.reduce((sum, temp) => sum + temp, 0) / temperaturas.length;
  const avgHumidity = umidades.reduce((sum, hum) => sum + hum, 0) / umidades.length;
  const avgWindSpeed = velocidadesVento.reduce((sum, speed) => sum + speed, 0) / velocidadesVento.length;
  const avgPressure = pressoes.reduce((sum, pressure) => sum + pressure, 0) / pressoes.length;

  const maxTemp = Math.max(...listaAmanha.map(i => i.main.temp_max));
  const minTemp = Math.min(...listaAmanha.map(i => i.main.temp_min));
  const principalDescricao = listaAmanha[0].weather[0].description; // Get description from the first available forecast for tomorrow

  return `
    <strong>Temperatura Média:</strong> ${avgTemp.toFixed(1)} °C (Min: ${minTemp.toFixed(1)}°C, Max: ${maxTemp.toFixed(1)}°C)<br>
    <strong>Clima:</strong> ${principalDescricao}<br>
    <strong>Umidade Média:</strong> ${avgHumidity.toFixed(1)}%<br>
    <strong>Vento Médio:</strong> ${(avgWindSpeed * 3.6).toFixed(1)} km/h<br>
    <strong>Pressão Média:</strong> ${avgPressure.toFixed(1)} hPa
  `;
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
      // Dados principais
      const temp = clima.main.temp.toFixed(1);
      const desc = clima.weather[0].description;
      const icone = clima.weather[0].icon;
      const iconeURL = `https://openweathermap.org/img/wn/${icone}@2x.png`;
      const hum = clima.main.humidity;
      const vento = (clima.wind.speed * 3.6).toFixed(1);
      const pressao = clima.main.pressure;

      // Nascer e pôr do sol
      const nascer = new Date(clima.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const por = new Date(clima.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      resultado.innerHTML = `
        <strong>🌡️ Clima Atual:</strong><br>
        <img src="${iconeURL}" alt="${desc}" title="${desc}" width="60"><br>
        <strong>Temperatura:</strong> ${temp} °C<br>
        <strong>Clima:</strong> ${desc}<br>
        <strong>Umidade:</strong> ${hum}%<br>
        <strong>Vento:</strong> ${vento} km/h<br>
        <strong>Pressão:</strong> ${pressao} hPa<br>
        <strong>☀️ Nascer do Sol:</strong> ${nascer}<br>
        <strong>🌇 Pôr do Sol:</strong> ${por}
      `;

      // Previsão resumida do primeiro item + probabilidade de chuva
      const resumoHoje = previsao.list[0].weather[0].description;
      const probChuva = Math.round(previsao.list[0].pop * 100); // 0.4 → 40%
      previsaoDiv.innerHTML = `
        <strong>🕒 Previsão para Hoje:</strong><br>
        ${resumoHoje}<br>
        🌧️ Chance de chuva: ${probChuva}%
      `;

      // Previsão detalhada de amanhã
      const textoPrevisaoAmanha = obterPrevisaoAmanha(previsao);
      previsaoAmanhaDiv.innerHTML = `<strong>🗓️ Previsão para Amanhã:</strong><br>${textoPrevisaoAmanha}`;

      // Recomendação de roupa
      const recomendacao = recomendarRoupa(clima.main.temp, desc);
      atividadeDiv.innerHTML = `<strong>👕 Recomendações:</strong><br>${recomendacao}`;

      // Qualidade do ar
      const qualidade = interpretarQualidadeAr(qualidadeAr.list[0].main.aqi);
      qualidadeArDiv.innerHTML = `<strong>💨 Qualidade do Ar:</strong><br>${qualidade}`;

      // Alertas
      if (previsao.city && previsao.city.alerts && previsao.city.alerts.length > 0) {
        const textoAlertas = previsao.city.alerts.map(a => a.description).join('<br>');
        alertasDiv.innerHTML = `<strong>⚠️ Alertas:</strong><br>${textoAlertas}`;
        enviarNotificacao(textoAlertas);
      } else {
        alertasDiv.innerHTML = `<strong>⚠️ Alertas:</strong><br>Nenhum alerta climático.`;
      }

      // Mapa
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