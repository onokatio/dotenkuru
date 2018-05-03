'use strict';

var _bffx_side = 'NO POSITION';
var _bf_side = 'NO POSITION';
var _bfn_side = 'NO POSITION';
var _bm_side = 'NO POSITION';
var _tabId = 0;
var _bffxData = {
	'last': 0,
	'high': 0,
	'low': 0,
	'side': 'NO POSITION',
	'time': '',
	'sfd_level': 0,
	'sfd_last_level': 0,
	'sfd_last_notify_time': 0,
	'sfd1': '0.0',
	'sfd2': '0.0'
};
var _bfData = {
	'last': 0,
	'high': 0,
	'low': 0,
	'side': 'NO POSITION',
	'time': ''
};
var _bfnData = {
	'last': 0,
	'high': 0,
	'low': 0,
	'side': 'NO POSITION',
	'time': ''
};
var _bmData = {
	'last': 0,
	'high': 0,
	'low': 0,
	'side': 'NO POSITION',
	'time': ''
};

function cw_channel(ohlcv) {
	const range_len = 18;
	const ohlcv_len = ohlcv.length;
	let index = ohlcv_len - 2;
	let ch_high = ohlcv[index][2];
	let ch_low = ohlcv[index][3];
	for (let i = 0; i < range_len; i++, index--) {
		//	 console.log(index);
		//	 console.log(ohlcv[index]);
		if (ohlcv[index][2] > ch_high) {
			ch_high = ohlcv[index][2];
		}
		if (ohlcv[index][3] < ch_low) {
			ch_low = ohlcv[index][3];
		}
	}
	return {'high': ch_high, 'low': ch_low};
}

function bm_channel(ohlcv) {
	const range_len = 18;
	const ohlcv_len = ohlcv['h'].length;
	let index = ohlcv_len - 2;
	let ch_high = ohlcv['h'][index];
	let ch_low = ohlcv['l'][index];
	for (let i = 0; i < range_len; i++, index--) {
		//	 console.log(index);
		//	 console.log(ohlcv[index]);
		if (ohlcv['h'][index] > ch_high) {
			ch_high = ohlcv['h'][index];
		}
		if (ohlcv['l'][index] < ch_low) {
			ch_low = ohlcv['l'][index];
		}
	}
	return {'high': ch_high, 'low': ch_low};
}

function getChannelData() {

	requestData('https://api.cryptowat.ch/markets/bitflyer/btcfxjpy/ohlc?periods=3600').then(function (data) {
		return JSON.parse(data);
	}).then(function (resData) {
		let ohlcv = resData['result']['3600'];
		let retChannel = cw_channel(ohlcv);
		_bffxData.high = retChannel['high'];
		_bffxData.low = retChannel['low'];
	}).catch(function (e) {
		console.log('Network Error', e);
	});

	requestData('https://api.cryptowat.ch/markets/bitflyer/btcjpy/ohlc?periods=3600').then(function (data) {
		return JSON.parse(data);
	}).then(function (resData) {
		let ohlcv = resData['result']['3600'];
		let retChannel = cw_channel(ohlcv);
		_bfData.high = retChannel['high'];
		_bfData.low = retChannel['low'];
	}).catch(function (e) {
		console.log('Network Error', e);
	});

	requestData('https://api.cryptowat.ch/markets/bitfinex/btcusd/ohlc?periods=3600').then(function (data) {
		return JSON.parse(data);
	}).then(function (resData) {
		let ohlcv = resData['result']['3600'];
		let retChannel = cw_channel(ohlcv);
		_bfnData.high = retChannel['high'];
		_bfnData.low = retChannel['low'];
	}).catch(function (e) {
		console.log('Network Error', e);
	});

	let now_time = getUnixTime();
	requestData('https://www.bitmex.com/api/udf/history?symbol=XBTUSD&resolution=60&from=' + (now_time - 3600 * 100).toString() + '&to=' + now_time.toString()).then(function (data) {
		return JSON.parse(data);
	}).then(function (resData) {
		let ohlcv = resData;
		let retChannel = bm_channel(ohlcv);
		_bmData.high = retChannel['high'];
		_bmData.low = retChannel['low'];
	}).catch(function (e) {
		console.log('Network Error', e);
	});
}

function main() {
	getBotStatus();

	// bitFlyer-FX
	if (_bffxData.high > 0 && _bffxData.low > 0) {

		requestData('https://api.bitflyer.jp/v1/getticker?product_code=FX_BTC_JPY').then(function (data) {
			return JSON.parse(data);
		}).then(function (resBfData) {
			let last_price = resBfData.ltp;

			let now = new Date();
			if (last_price > _bffxData.high && _bffx_side !== 'LONG') {
				_bffx_side = 'LONG';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'bitFlyer FX ロングエントリー開始',
						iconUrl: 'img/bffx_long.png',
						message: '価格: ' + format_jpy(last_price) + '\nL価格: ' + format_jpy(_bffxData.high) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			else if (last_price < _bffxData.low && _bffx_side !== 'SHORT') {
				_bffx_side = 'SHORT';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'bitFlyer FX ショートエントリー開始',
						iconUrl: 'img/bffx_short.png',
						message: '価格: ' + format_jpy(last_price) + '\nS価格: ' + format_jpy(_bffxData.low) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			_bffxData.last = last_price;
			_bffxData.side = _bffx_side;
			_bffxData.time = now.toLocaleTimeString();

			if (_bffxBotStatus.side === 'LONG') {
				_bffxBotStatus.now_ppl = last_price - _bffxBotStatus.entry_price;
			}
			else if (_bffxBotStatus.side === 'SHORT') {
				_bffxBotStatus.now_ppl = _bffxBotStatus.entry_price - last_price;
			}

		}).catch(function (e) {
			console.log('Network Error', e);
		});
	}

	// bitFlyer
	if (_bfData.high > 0 && _bfData.low > 0) {

		requestData('https://api.bitflyer.jp/v1/getticker?product_code=BTC_JPY').then(function (data) {
			return JSON.parse(data);
		}).then(function (resBfData) {
			let last_price = resBfData.ltp;

			let now = new Date();
			if (last_price > _bfData.high && _bf_side !== 'LONG') {
				_bf_side = 'LONG';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'bitFlyer 現物 ロングエントリー開始',
						iconUrl: 'img/bf_long.png',
						message: '価格: ' + format_jpy(last_price) + '\nL価格: ' + format_jpy(_bfData.high) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			else if (last_price < _bfData.low && _bf_side !== 'SHORT') {
				_bf_side = 'SHORT';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'bitFlyer 現物 ショートエントリー開始',
						iconUrl: 'img/bf_short.png',
						message: '価格: ' + format_jpy(last_price) + '\nS価格: ' + format_jpy(_bfData.low) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			_bfData.last = last_price;
			_bfData.side = _bf_side;
			_bfData.time = now.toLocaleTimeString();

		}).catch(function (e) {
			console.log('Network Error', e);
		});
	}

	// Bitfinex
	if (_bfnData.high > 0 && _bfnData.low > 0) {

		requestData('https://api.cryptowat.ch/markets/bitfinex/btcusd/price').then(function (data) {
			return JSON.parse(data);
		}).then(function (resBfData) {
			let last_price = resBfData['result'].price;

			let now = new Date();
			if (last_price > _bfnData.high && _bfn_side !== 'LONG') {
				_bfn_side = 'LONG';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'Bitfinex ロングエントリー開始',
						iconUrl: 'img/bfn_long.png',
						message: '価格: ' + format_usd(last_price) + '\nL価格: ' + format_usd(_bfnData.high) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			else if (last_price < _bfnData.low && _bfn_side !== 'SHORT') {
				_bfn_side = 'SHORT';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'Bitfinex ショートエントリー開始',
						iconUrl: 'img/bfn_short.png',
						message: '価格: ' + format_usd(last_price) + '\nS価格: ' + format_usd(_bfnData.low) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			_bfnData.last = last_price;
			_bfnData.side = _bfn_side;
			_bfnData.time = now.toLocaleTimeString();

		}).catch(function (e) {
			console.log('Network Error', e);
		});
	}

	// BitMEX
	if (_bmData.high > 0 && _bmData.low > 0) {

		requestData('https://www.bitmex.com/api/v1/instrument?symbol=XBTUSD&columns=lastPrice').then(function (data) {
			return JSON.parse(data);
		}).then(function (resBfData) {
			let last_price = resBfData[0].lastPrice;

			let now = new Date();
			if (last_price > _bmData.high && _bm_side !== 'LONG') {
				_bm_side = 'LONG';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'BitMEX ロングエントリー開始',
						iconUrl: 'img/bm_long.png',
						message: '価格: ' + format_usd(last_price) + '\nL価格: ' + format_usd(_bmData.high) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			else if (last_price < _bmData.low && _bm_side !== 'SHORT') {
				_bm_side = 'SHORT';
				chrome.notifications.create('tabId_' + (_tabId++).toString(), {
						type: 'basic',
						title: 'BitMEX ショートエントリー開始',
						iconUrl: 'img/bm_short.png',
						message: '価格: ' + format_usd(last_price) + '\nS価格: ' + format_usd(_bmData.low) + '\n時刻: ' + now.toLocaleTimeString(),
						contextMessage: 'ドテンくる',
						requireInteraction: true,
						isClickable: true
					}, function (notificationId) {
						playSound();
					}
				);
			}
			_bmData.last = last_price;
			_bmData.side = _bm_side;
			_bmData.time = now.toLocaleTimeString();

			if (_bmBotStatus.side === 'LONG') {
				_bmBotStatus.now_ppl = last_price - _bmBotStatus.entry_price;
			}
			else if (_bmBotStatus.side === 'SHORT') {
				_bmBotStatus.now_ppl = _bmBotStatus.entry_price - last_price;
			}

		}).catch(function (e) {
			console.log('Network Error', e);
		});
	}

	// SFD
	requestData('https://lightning.bitflyer.jp/api/trade/ticker/all?v=1').then(function (data) {
		return JSON.parse(data);
	}).then(function (resBfData) {

		let btcjpy_price = 0;
		let fxbtcjpy_price = 0;
		resBfData.forEach(function (item) {
			if (item.product_code === 'BTC_JPY') {
				btcjpy_price = item.ticker.LTP;
			}
			else if (item.product_code === 'FX_BTC_JPY') {
				fxbtcjpy_price = item.ticker.LTP;
			}
		});
		if (btcjpy_price > 0 && fxbtcjpy_price > 0) {
			let sfd1_value = ((fxbtcjpy_price / btcjpy_price) - 1.0) * 100;
			let sfd2_value = '0.0';
			if (sfd1_value >= 5.0 && sfd1_value < 10.0) {
				sfd2_value = '0.25';
				_bffxData.sfd_level = 1;
			}
			else if (sfd1_value >= 10.0 && sfd1_value < 15.0) {
				sfd2_value = '0.5';
				_bffxData.sfd_level = 2;
			}
			else if (sfd1_value >= 15.0 && sfd1_value < 20.0) {
				sfd2_value = '1.0';
				_bffxData.sfd_level = 3;
			}
			else if (sfd1_value >= 20.0) {
				sfd2_value = '2.0';
				_bffxData.sfd_level = 4;
			}
			else {
				_bffxData.sfd_level = 0;
			}

			let now = new Date();
			let now_unixtime = Math.floor(now.getTime() / 1000);
			if (sfd1_value >= 5.0 && _bffxData.sfd_level > _bffxData.sfd_last_level && now_unixtime > _bffxData.sfd_last_notify_time + 600) {
				sfd1_value = Math.floor((sfd1_value * 10)) / 10;
				if (sfd1_value % 1 === 0) {
					sfd1_value = sfd1_value.toString() + '.0';
				}

				_bffxData.sfd_last_notify_time = now_unixtime;

				chrome.storage.local.get('enableSFD', function (value) {
					let enableSFD = value.enableSFD;
					if (enableSFD) {
						chrome.notifications.create('tabId_sfd', {
								type: 'basic',
								title: 'bitFlyer SFD 発生',
								iconUrl: 'img/sfd.png',
								message: '価格乖離: ' + sfd1_value + '％\nSFD比率: ' + sfd2_value + '％\n時刻: ' + now.toLocaleTimeString(),
								contextMessage: 'ドテンくる',
								requireInteraction: false,
								isClickable: true
							}, function (notificationId) {
								playSound();
							}
						);
					}
				});

			} else {
				sfd1_value = Math.floor((sfd1_value * 10)) / 10;
				if (sfd1_value % 1 === 0) {
					sfd1_value = sfd1_value.toString() + '.0';
				}
			}

			_bffxData.sfd_last_level = _bffxData.sfd_level;
			_bffxData.sfd1 = sfd1_value;
			_bffxData.sfd2 = sfd2_value;
		}

	}).catch(function (e) {
		console.log('Network Error', e);
	});

}

var _soundVol = 1.0;

function playSound() {
	chrome.storage.local.get(['enableSound', 'soundVol'], function (value) {
		let tmp_vol = value.soundVol;
		if (tmp_vol == null) {
			tmp_vol = 1.0;
		}
		_soundVol = tmp_vol;
		let enableSound = value.enableSound;
		if (enableSound) {
			var sound = new Audio('sound/ding.ogg');
			sound.volume = _soundVol;
			sound.play();
		}
	});
}

chrome.storage.local.get(['enableSound', 'enableSFD'], function (value) {
	let enableSound = value.enableSound;
	if (enableSound == null) {
		chrome.storage.local.set({'enableSound': true});
	}
	let enableSFD = value.enableSFD;
	if (enableSFD == null) {
		chrome.storage.local.set({'enableSFD': true});
	}
});

function requestData(url) {
	return new Promise(function (resolve, reject) {
		let request = new XMLHttpRequest();
		request.onload = function () {
			if (request.status === 200) {
				resolve(request.response)
			}
			else {
				reject(request.status);
			}
		};
		request.onerror = function (e) {
			reject(e);
		};
		request.open('GET', url);
		request.send();
	});
}

function getUnixTime() {
	return Math.floor((new Date) / 1000);
}

function format_jpy(price) {
	return price.toLocaleString('ja-JP') + '円';
}

function format_usd(price) {
	return '＄' + price.toLocaleString('en-US');
}

chrome.notifications.onClicked.addListener(function (notificationId) {
	chrome.notifications.clear(notificationId);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.type === 'popup') {
		sendResponse({
			'bffxData': _bffxData,
			'bfData': _bfData,
			'bfnData': _bfnData,
			'bmData': _bmData,
			'bffxBotStatus': _bffxBotStatus,
			'bmBotStatus': _bmBotStatus
		});
	}
});

var _bffxBotStatus = {
	'entry_price': 0,
	'size': 0,
	'ppl': 0,
	'now_ppl': 0,
	'side': 'NO POSITION',
	'entry_time': 0,
	'debut_price': 0,
	'debut_time': 0,
	'win_rate': 0,
	'trade_cnt': 0,
	'funds': 0,
	'leverage': 0
};
var _bmBotStatus = {
	'entry_price': 0,
	'size': 0,
	'ppl': 0,
	'now_ppl': 0,
	'side': 'NO POSITION',
	'entry_time': 0,
	'debut_price': 0,
	'debut_time': 0,
	'win_rate': 0,
	'trade_cnt': 0,
	'funds': 0,
	'leverage': 0
};

function getBotStatus() {
	requestData('https://cryptokaeru.github.io/bot_status.json?' + (new Date()).getTime()).then(function (data) {
		return JSON.parse(data);
	}).then(function (resData) {
		//	console.log(resData);
		_bffxBotStatus.entry_price = resData.bffx.entry_price;
		_bffxBotStatus.size = resData.bffx.size;
		_bffxBotStatus.ppl = resData.bffx.ppl;
		_bffxBotStatus.side = resData.bffx.side;
		_bffxBotStatus.entry_time = resData.bffx.entry_time;
		_bffxBotStatus.debut_price = resData.bffx.debut_price;
		_bffxBotStatus.debut_time = resData.bffx.debut_time;
		_bffxBotStatus.win_rate = resData.bffx.win_rate;
		_bffxBotStatus.trade_cnt = resData.bffx.trade_cnt;
		_bffxBotStatus.funds = resData.bffx.funds;
		_bffxBotStatus.leverage = resData.bffx.leverage;

		_bmBotStatus.entry_price = resData.bm.entry_price;
		_bmBotStatus.size = resData.bm.size;
		_bmBotStatus.ppl = resData.bm.ppl;
		_bmBotStatus.side = resData.bm.side;
		_bmBotStatus.entry_time = resData.bm.entry_time;
		_bmBotStatus.debut_price = resData.bm.debut_price;
		_bmBotStatus.debut_time = resData.bm.debut_time;
		_bmBotStatus.win_rate = resData.bm.win_rate;
		_bmBotStatus.trade_cnt = resData.bm.trade_cnt;
		_bmBotStatus.funds = resData.bm.funds;
		_bmBotStatus.leverage = resData.bm.leverage;
	}).catch(function (e) {
		console.log('Network Error', e);
	});
}

getBotStatus();
getChannelData();
setInterval(getChannelData, 60 * 1000);

setTimeout(function () {
	main();
	setInterval(main, 5 * 1000);
}, 5 * 1000);
