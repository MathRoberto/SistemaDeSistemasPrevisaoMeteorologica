const btn = document.getElementById('btn-verificar');
const resultado = document.getElementById('resultado');
const previsaoDiv = document.getElementById('previsao');
const previsaoAmanhaDiv = document.getElementById('previsao-amanha');
const atividadeDiv = document.getElementById('atividade');
const qualidadeArDiv = document.getElementById('qualidade-ar');
const alertasDiv = document.getElementById('alertas');
const mapDiv = document.getElementById('map');

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

  return lista.map(item => {
    const dt = new Date(item.dt * 1000);
    const hora = dt.getHours().toString().padStart(2, '0');
    const desc = item.weather[0].description;
    const temp = item.main.temp;
    return `${hora}h - ${desc}, ${temp.toFixed(1)} °C`;
  }).join('<br>');
}

// Clique no botão
btn.addEventListener('click', async () => {
  resultado.textContent = 'Obtendo localização...';
  previsaoDiv.textContent = '';
  previsaoAmanhaDiv.textContent = '';
  atividadeDiv.textContent = '';
  qualidadeArDiv.textContent = '';
  alertasDiv.textContent = '';
  mapDiv.classList.remove('active');

  try {
    const localizacao = await obterLocalizacao();
    resultado.textContent = 'Obtendo clima...';

    const clima = await obterClima(localizacao.lat, localizacao.lon);
    const previsao = await obterPrevisao(localizacao.lat, localizacao.lon);
    const qualidadeAr = await obterQualidadeAr(localizacao.lat, localizacao.lon);

    if (clima.weather && clima.weather.length > 0) {
      const descricao = clima.weather[0].description;
      const temperatura = clima.main.temp;
      const sensacao = clima.main.feels_like;
      const recomendacao = recomendarRoupa(temperatura, descricao);
      const atividade = sugerirAtividade(descricao);

      const previsoes = previsao.list.slice(0, 3).map(item => {
        const dt = new Date(item.dt * 1000);
        const hora = dt.getHours().toString().padStart(2, '0');
        const desc = item.weather[0].description;
        const temp = item.main.temp;
        return `${hora}h - ${desc}, ${temp.toFixed(1)} °C`;
      }).join('<br>');

      const previsaoAmanhaTexto = obterPrevisaoAmanha(previsao);

      const aqi = qualidadeAr.list[0].main.aqi;
      const qualidadeTexto = interpretarQualidadeAr(aqi);

      resultado.innerHTML = `
        <strong>Local:</strong> ${clima.name}<br>
        <strong>Clima:</strong> ${descricao}<br>
        <strong>Temperatura:</strong> ${temperatura.toFixed(1)} °C<br>
        <strong>Sensação térmica:</strong> ${sensacao.toFixed(1)} °C<br>
        <strong>Recomendação:</strong> ${recomendacao}
      `;

      previsaoDiv.innerHTML = `<strong>Previsão para as próximas horas:</strong><br>${previsoes}`;
      previsaoAmanhaDiv.innerHTML = `<strong>Previsão para amanhã:</strong><br>${previsaoAmanhaTexto}`;
      atividadeDiv.innerHTML = `<strong>Sugestão de atividade:</strong><br>${atividade}`;
      qualidadeArDiv.innerHTML = `<strong>Qualidade do ar:</strong><br>${qualidadeTexto}`;
      alertasDiv.innerHTML = `<strong>Alertas:</strong><br>Nenhum alerta grave no momento.`;

      // Exibir blocos
      resultado.style.display = 'block';
      previsaoDiv.style.display = 'block';
      previsaoAmanhaDiv.style.display = 'block';
      atividadeDiv.style.display = 'block';
      qualidadeArDiv.style.display = 'block';
      alertasDiv.style.display = 'block';

      // Notificação
      let mensagem = `Clima: ${descricao}, ${temperatura.toFixed(1)} °C`;
      if (temperatura > 35) mensagem = `⚠️ ALERTA DE CALOR! ${mensagem}`;
      enviarNotificacao(mensagem);

      // Mapa
      mapDiv.classList.add('active');
      if (mapDiv._leaflet_id) {
        mapDiv._leaflet_id = null;
        mapDiv.innerHTML = '';
      }

      const map = L.map('map').setView([localizacao.lat, localizacao.lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([localizacao.lat, localizacao.lon]).addTo(map)
        .bindPopup(`${clima.name}`)
        .openPopup();

    } else {
      resultado.innerHTML = `Erro na resposta da API: ${clima.message || 'Resposta inesperada'}`;
      resultado.style.display = 'block';
    }

  } catch (error) {
    resultado.textContent = `Erro: ${error.message || error}`;
    resultado.style.display = 'block';
  }
});
