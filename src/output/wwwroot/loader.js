/* eslint-disable no-undef */
let socket = null;
let reconnectCount = 1;
let socketReconnectTimeout = null;

// eslint-disable-next-line no-unused-vars
function loadData() { // this function is run on page load.
  if (WebSocket) {
    createSocket();
  } else {
    refreshData();
  }
}

function createSocket() {
  if (socketReconnectTimeout) clearInterval(socketReconnectTimeout);
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${window.location.hostname}:${window.location.port}/`;
  socket = new WebSocket(wsUrl);
  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    // console.log('Got data from server %s', JSON.stringify(data, null, 2))
    if (!data.err) updateData(data);
    else console.log('Got error message %s', data.err);
  };
  socket.onopen = (ev) => {
    reconnectCount = 1;
    $('.status').text('');
  };
  socket.onerror = (ev) => {
    socket.close();
  };
  socket.onclose = (ev) => {
    console.debug('Close event');
    socketReconnectTimeout = setTimeout(checkSocketConnection, reconnectCount ^ 2 * 1000);
    $('.status').text('disconnected');
  };
}

function checkSocketConnection() {
  if (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING) {
    console.log('Trying to reconnect to websocket..');
    if (reconnectCount < 10) reconnectCount++;
    createSocket();
  }
}

function refreshData() {
  $.getJSON('/api/reading', (data) => {
    if (data && !data.err) {
      updateData(data);
    }
    setTimeout(refreshData, 10000);
  });
}

function updateData(data) {
  if (data.calculatedUsage < 0) {
    $('.delivery').show();
    $('.usage').hide();
    $('.calcUsage').text(data.calculatedUsage * -1);
  } else {
    $('.delivery').hide();
    $('.usage').show();
    $('.calcUsage').text(data.calculatedUsage);
  }
  $('#tarrifCheckbox').prop('checked', data.currentTarrif === 2);

  $('.currentUsage').text(data.currentUsage || 0);
  $('.currentDelivery').text(data.currentDelivery || 0);
  $('.totalT1Usage').text(Math.round(data.totalT1Use || 0));
  $('.totalT2Usage').text(Math.round(data.totalT2Use || 0));
  $('.totalT1Delivered').text(Math.round(data.totalT1Delivered || 0));
  $('.totalT2Delivered').text(Math.round(data.totalT2Delivered || 0));

  let currentUsageL1 = Math.round(((data.currentUsageL1 || 0) + (data.currentDeliveryL1 || 0) * -1) * 1000);
  if (currentUsageL1 < 0) {
    $('.currentUsageL1').text(currentUsageL1 * -1);
    $('.deliveryL1').show();
    $('.usageL1').hide();
  } else {
    $('.currentUsageL1').text(currentUsageL1);
    $('.deliveryL1').hide();
    $('.usageL1').show();
  }

  let currentUsageL2 = Math.round(((data.currentUsageL2 || 0) + (data.currentDeliveryL2 || 0) * -1) * 1000);
  if (currentUsageL2 < 0) {
    $('.currentUsageL2').text(currentUsageL2 * -1);
    $('.deliveryL2').show();
    $('.usageL2').hide();
  } else {
    $('.currentUsageL2').text(currentUsageL2);
    $('.deliveryL2').hide();
    $('.usageL2').show();
  }

  let currentUsageL3 = Math.round(((data.currentUsageL3 || 0) + (data.currentDeliveryL3 || 0) * -1) * 1000);
  if (currentUsageL3 < 0) {
    $('.currentUsageL3').text(currentUsageL3 * -1);
    $('.deliveryL3').show();
    $('.usageL3').hide();
  } else {
    $('.currentUsageL3').text(currentUsageL3);
    $('.deliveryL3').hide();
    $('.usageL3').show();
  }

  $('.powerLabel').attr('title', data.powerSn);
  $('.powerTs').text(data.powerTs);

  $('.gasLabel').attr('title', data.gasSn);
  $('.gasTs').text(data.gas.ts);
  let gas = data.gas.totalUse;
  gas = Math.round(gas * 100.0) / 100.0;
  $('.totalGas').text(gas);

  if(data.houseUsage) {
    // Load solar
    $('.houseUsage').text(data.houseUsage);
    $('.solarProduction').text(Math.round(data.solarProduction));
    $('.solar').removeClass('hide');
  }
}
